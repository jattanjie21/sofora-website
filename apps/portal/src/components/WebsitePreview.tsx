import { useWorkspace } from "../data/WorkspaceProvider";
import { resolveImages } from "../../../web/src/data/LiveWebsite";
import { useEffect, useRef, useState } from "react";
import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function WebsitePreview({
  content,
  path,
  version,
}: {
  content: WebsiteContent;
  path: string;
  version: string;
}) {
  const { images: savedImages } = useWorkspace();
  const references = [...new Set([...Object.values(content.copy), ...content.board.map((p) => p[2]), ...content.staff.map((p) => p[2])].filter(value => value.startsWith("storage:")))];
  const uploadedImages = useQuery(api.media.urls, references.length ? { references } : "skip");
  const images = { ...savedImages, ...uploadedImages };
  const frame = useRef<HTMLIFrameElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setAvailableWidth(entry.contentRect.width);
    });
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);
  const viewportWidth = mobile ? 375 : 1280;
  const scale = Math.min(1, (availableWidth || viewportWidth) / viewportWidth);
  function sendContent() {
    frame.current?.contentWindow?.postMessage(
      { type: "sofora-website-preview", content: resolveImages(content, images) },
      window.location.origin,
    );
  }
  useEffect(() => {
    sendContent();
    const ready = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "sofora-preview-ready"
      )
        sendContent();
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [content, images]);
  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <div>
          <span className="preview-dot" />
          <strong>{version} preview</strong>
          <small>{path}</small>
        </div>
        <div className="segmented">
          <button aria-pressed={!mobile} onClick={() => setMobile(false)}>
            Desktop
          </button>
          <button aria-pressed={mobile} onClick={() => setMobile(true)}>
            Mobile
          </button>
        </div>
      </div>
      <div ref={canvas} className="preview-canvas">
        <div
          style={{
            width: viewportWidth * scale,
            height: 680,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <iframe
            ref={frame}
            title={`${version} website preview`}
            src={`/preview${path}`}
            onLoad={sendContent}
            style={{
              width: viewportWidth,
              height: 680 / scale,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>
      <p className="preview-caption">
        Uses the public website’s layouts. External links are disabled in this
        preview.
      </p>
    </div>
  );
}

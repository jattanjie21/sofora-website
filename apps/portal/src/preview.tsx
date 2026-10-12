import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "../../web/src/App";
import {
  WebsiteContentContext,
  type WebsiteContent,
} from "../../web/src/data/WebsiteContent";
import "../../web/src/styles.css";

function Preview() {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === window.parent &&
        event.data?.type === "sofora-website-preview"
      )
        setContent(event.data.content as WebsiteContent);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage(
      { type: "sofora-preview-ready" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", receive);
  }, []);
  if (!content)
    return (
      <p style={{ padding: 32 }}>
        Open a content preview from the staff portal.
      </p>
    );
  return (
    <WebsiteContentContext.Provider value={content}>
      <BrowserRouter basename="/preview">
        <div
          onClickCapture={(event) => {
            const anchor = (event.target as Element).closest("a");
            if (
              anchor &&
              /^(https?:|mailto:|tel:)/i.test(anchor.getAttribute("href") ?? "")
            )
              event.preventDefault();
          }}
        >
          <App preview />
        </div>
      </BrowserRouter>
    </WebsiteContentContext.Provider>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);

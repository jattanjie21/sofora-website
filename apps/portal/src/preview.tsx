import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router";
import { App } from "../../web/src/App";
import {
  WebsiteContentContext,
  type WebsiteContent,
} from "../../web/src/data/WebsiteContent";
import { SiteSkeleton } from "../../web/src/components/Skeleton";
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
    return <SiteSkeleton path={window.location.pathname.replace(/^\/preview/, "")} />;
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

// Pages with forms call Convex hooks; they skip the actual submit when `preview` is set.
createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)}>
    <Preview />
  </ConvexProvider>,
);

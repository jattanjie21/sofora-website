import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

if (
  window.location.pathname === "/preview" ||
  window.location.pathname.startsWith("/preview/")
) {
  void import("./preview");
} else {
  void Promise.all([import("./App"), import("./components/Toast"), import("./styles.css")]).then(
    ([{ App }, { ToastProvider }]) => {
      createRoot(document.getElementById("root")!).render(
        <StrictMode>
          <ConvexAuthProvider client={new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)}><ToastProvider><App /></ToastProvider></ConvexAuthProvider>
        </StrictMode>,
      );
    },
  );
}

import { createContext, useContext } from "react";
import { defaultWebsiteContent } from "./websiteDefaults";
export { defaultWebsiteContent, type WebsiteContent } from "./websiteDefaults";

// The public app uses the original content. The portal supplies preview content.
export const WebsiteContentContext = createContext(defaultWebsiteContent);
export function useWebsite() {
  return useContext(WebsiteContentContext);
}

import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { api } from "../../../../convex/_generated/api";
import { WebsiteContentContext, type WebsiteContent } from "./WebsiteContent";

export function resolveImages(content:WebsiteContent,images:Record<string,string|null>):WebsiteContent {
  const copy={...content.copy};
  for(const key of Object.keys(copy) as (keyof typeof copy)[]) if(copy[key].startsWith("storage:")) copy[key]=images[copy[key]]??"/images/sofora-logo.png";
  return {...content,copy};
}
export function LiveWebsite({children}:{children:ReactNode}) {
  const result=useQuery(api.content.published);
  if(!result) return <main className="container section" role="status">Loading Sofora…</main>;
  const content=resolveImages(JSON.parse(result.content),result.images);
  return <WebsiteContentContext.Provider value={content}>{children}</WebsiteContentContext.Provider>;
}

import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { api } from "../../../../convex/_generated/api";
import { WebsiteContentContext, type WebsiteContent } from "./WebsiteContent";

// Swaps uploaded-photo references ("storage:…") for their web addresses.
export function resolveImages(content:WebsiteContent,images:Record<string,string|null>):WebsiteContent {
  const resolve=(value:string)=>value.startsWith("storage:")?images[value]??"/images/logo.png":value;
  const copy={...content.copy};
  for(const key of Object.keys(copy) as (keyof typeof copy)[]) copy[key]=resolve(copy[key]);
  const people=(list:WebsiteContent["board"])=>list.map(([name,role,photo])=>[name,role,resolve(photo)] as typeof list[number]);
  return {...content,copy,board:people(content.board),staff:people(content.staff)};
}
export function LiveWebsite({children}:{children:ReactNode}) {
  const result=useQuery(api.content.published);
  if(!result) return <main className="container section" role="status">Loading Sofora…</main>;
  const content=resolveImages(JSON.parse(result.content),result.images);
  return <WebsiteContentContext.Provider value={content}>{children}</WebsiteContentContext.Provider>;
}

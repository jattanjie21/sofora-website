import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { api } from "../../../../convex/_generated/api";
import { SiteSkeleton } from "../components/Skeleton";
import { defaultCopy } from "./copy";
import { WebsiteContentContext, type WebsiteContent } from "./WebsiteContent";

// Swaps uploaded-photo references ("storage:…") for their web addresses.
export function resolveImages(content:WebsiteContent,images:Record<string,string|null>):WebsiteContent {
  const resolve=(value:string)=>value.startsWith("storage:")?images[value]??"/images/logo.png":value;
  const copy={...content.copy};
  for(const key of Object.keys(copy) as (keyof typeof copy)[]) copy[key]=resolve(copy[key]);
  const people=(list:WebsiteContent["board"])=>list.map(person=>({...person,photo:resolve(person.photo)}));
  return {...content,copy,board:people(content.board),staff:people(content.staff),partners:content.partners.map(p=>({...p,logo:resolve(p.logo)}))};
}
export function LiveWebsite({children}:{children:ReactNode}) {
  const result=useQuery(api.content.published);
  if(!result) return <SiteSkeleton path={window.location.pathname} />;
  const published = JSON.parse(result.content) as WebsiteContent;
  const content = resolveImages(
    { ...published, copy: { ...defaultCopy, ...published.copy } },
    result.images,
  );
  return <WebsiteContentContext.Provider value={content}>{children}</WebsiteContentContext.Provider>;
}

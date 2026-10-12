import { v, ConvexError } from "convex/values";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { documentKey, activity } from "./validators";
import { staffQuery, staffMutation, requirePermission, log, activityDto } from "./lib/access";
import { defaultWebsiteContent, type WebsiteContent } from "../apps/web/src/data/websiteDefaults";
import { copyFields } from "../apps/web/src/data/copy";
import { applyDocument, contentError, documents } from "../apps/portal/src/data/content";
import type { DocumentId } from "../apps/portal/src/data/types";

export function slice(content:WebsiteContent,key:DocumentId) {
  return JSON.stringify({copy:Object.fromEntries(copyFields.filter(f=>f.page===key).map(f=>[f.key,content.copy[f.key]])),
    ...(key==="board"?{board:content.board}:key==="staff"?{staff:content.staff}:key==="loans"?{loans:content.loans}:key==="contact"?{contact:content.contact}:key==="faq"?{faqs:content.faqs}:{})});
}
export function merge(content:WebsiteContent,payload:string,key:DocumentId) {
  const data=JSON.parse(payload);
  return applyDocument(content,{...defaultWebsiteContent,...data,copy:{...defaultWebsiteContent.copy,...data.copy}},key);
}
async function validate(ctx:QueryCtx,payload:string,key:DocumentId) {
  if(payload.length>300000) throw new ConvexError("This page is too large. Shorten its content before saving.");
  let content:WebsiteContent;
  try {
    const data=JSON.parse(payload);
    content=applyDocument(structuredClone(defaultWebsiteContent),data,key);
    const images:string[]=[];
    for(const f of copyFields.filter(f=>f.page===key)) {
      const value=content.copy[f.key];
      if(typeof value!=="string"||value.length>12000) throw new Error();
      if(f.kind==="image") images.push(value);
    }
    for(const group of [content.board,content.staff]) {
      if(!Array.isArray(group)||group.length>100||group.some(row=>!Array.isArray(row)||row.length!==3||row.some(s=>typeof s!=="string"||s.length>200))) throw new Error();
      images.push(...group.map(row=>row[2]));
    }
    for(const value of images) if(value.startsWith("storage:")) {
      const storageId=ctx.db.system.normalizeId("_storage",value.slice(8));
      const asset=storageId?await ctx.db.query("media").withIndex("by_storageId",q=>q.eq("storageId",storageId)).unique():null;
      if(!asset) throw new Error();
    }
    if(!Array.isArray(content.loans)||content.loans.length!==defaultWebsiteContent.loans.length||content.loans.some((p,i)=>p.id!==defaultWebsiteContent.loans[i]!.id||typeof p.title!=="string"||p.title.length>200||typeof p.description!=="string"||p.description.length>12000)) throw new Error();
    if(!Array.isArray(content.faqs)||content.faqs.length>100||content.faqs.some(f=>typeof f.question!=="string"||typeof f.answer!=="string"||f.question.length>1000||f.answer.length>12000)) throw new Error();
    if(typeof content.contact.email!=="string"||typeof content.contact.address!=="string"||content.contact.address.length>2000||!Array.isArray(content.contact.phones)||content.contact.phones.length>20) throw new Error();
  } catch {throw new ConvexError("The page contains invalid content.");}
  const error=contentError(content,key);
  if(error) throw new ConvexError(error);
  return slice(content,key);
}
export async function publishedContent(ctx:QueryCtx) {
  let content=structuredClone(defaultWebsiteContent);
  for(const page of await ctx.db.query("pages").take(50)) content=merge(content,page.published,page.key as DocumentId);
  return content;
}
async function imageUrls(ctx:QueryCtx,contents:WebsiteContent[]) {
  const ids=[...new Set(contents.flatMap(content=>[...Object.values(content.copy),...content.board.map(p=>p[2]),...content.staff.map(p=>p[2])].filter(value=>value.startsWith("storage:")).map(value=>value.slice(8))))];
  return Object.fromEntries(await Promise.all(ids.map(async id=>[`storage:${id}`,await ctx.storage.getUrl(id as Id<"_storage">)])));
}
export const published=query({args:{},returns:v.object({content:v.string(),images:v.record(v.string(),v.union(v.string(),v.null()))}),handler:async ctx=>{
  const content=await publishedContent(ctx);
  return {content:JSON.stringify(content),images:await imageUrls(ctx,[content])};
}});
export const workspace=staffQuery({args:{},returns:v.array(v.object({id:documentKey,revision:v.number(),updatedAt:v.string(),updatedBy:v.string(),history:v.array(activity)})),handler:async ctx=>{
  requirePermission(ctx.person,"content:view");
  return await Promise.all((await ctx.db.query("pages").take(50)).map(async page=>{
    const history=await ctx.db.query("activity").withIndex("by_entity_and_note",q=>q.eq("entity",page.key).eq("note",false)).order("desc").take(20);
    return {id:page.key,revision:page.revision,updatedAt:page.updatedAt,updatedBy:page.updatedBy,history:history.map(activityDto)};
  }));
}});
export const save=staffMutation({args:{key:documentKey,revision:v.number(),content:v.string()},returns:v.number(),handler:async(ctx,args)=>{
  const key=args.key as DocumentId;
  requirePermission(ctx.person,"content:edit");
  const page=await ctx.db.query("pages").withIndex("by_key",q=>q.eq("key",key)).unique();
  if(!page) throw new ConvexError("Page not found. Finish backend initialization.");
  if(page.revision!==args.revision) throw new ConvexError("Someone updated this page. Reload before saving to avoid overwriting their changes.");
  const revision=page.revision+1;
  await ctx.db.patch(page._id,{published:await validate(ctx,args.content,key),revision,updatedAt:new Date().toISOString(),updatedBy:ctx.person._id});
  await log(ctx,ctx.person._id,"content",key,`Updated ${documents.find(d=>d.id===key)!.title}`);
  return revision;
}});

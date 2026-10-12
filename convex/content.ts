import { v, ConvexError } from "convex/values";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { documentKey, activity } from "./validators";
import { staffQuery, staffMutation, requirePermission, log, activityDto } from "./lib/access";
import { defaultWebsiteContent, type WebsiteContent } from "../apps/web/src/data/websiteDefaults";
import { copyFields } from "../apps/web/src/data/copy";
import { applyDocument, contentError, documents, productFields } from "../apps/portal/src/data/content";
import { toPeople, type Product } from "../apps/web/src/data/content";
import type { DocumentId } from "../apps/portal/src/data/types";

export function slice(content:WebsiteContent,key:DocumentId) {
  return JSON.stringify({copy:Object.fromEntries(copyFields.filter(f=>f.page===key).map(f=>[f.key,content.copy[f.key]])),
    ...(key==="board"?{board:content.board}:key==="staff"?{staff:content.staff}:key==="loans"?{loans:content.loans}:key==="saving"?{savings:content.savings}:key==="contact"?{contact:content.contact}:key==="faq"?{faqs:content.faqs}:key==="partners"?{partners:content.partners}:{})});
}
// Stored products fill in fields added since they were saved; products are matched by id.
function withProductDefaults(stored:unknown,defaults:Product[]) {
  return Array.isArray(stored)?defaults.map(d=>({...d,...stored.find(p=>p?.id===d.id)})):stored;
}
const productsValid=(list:unknown,defaults:Product[])=>Array.isArray(list)&&list.length===defaults.length&&list.every((p,i)=>p?.id===defaults[i]!.id&&productFields.every(([k])=>typeof p[k]==="string"&&p[k].length<=(k==="title"?200:12000)));
export function merge(content:WebsiteContent,payload:string,key:DocumentId) {
  const data=JSON.parse(payload);
  for(const list of ["loans","savings"] as const) if(data[list]) data[list]=withProductDefaults(data[list],defaultWebsiteContent[list]);
  // Older saves hold people as [name, role, photo] rows.
  for(const list of ["board","staff"] as const) if(data[list]) data[list]=toPeople(data[list],defaultWebsiteContent[list]);
  return applyDocument(content,{...defaultWebsiteContent,...data,copy:{...defaultWebsiteContent.copy,...data.copy}},key);
}
const personLimits=[["slug",100],["name",200],["role",200],["photo",200],["quote",1000],["bio",12000],["since",50],["focus",4000],["email",254]] as const;
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
      if(!Array.isArray(group)||group.length>100||group.some(p=>!p||personLimits.some(([k,max])=>typeof p[k]!=="string"||p[k].length>max))) throw new Error();
      images.push(...group.map(p=>p.photo));
    }
    if(!Array.isArray(content.partners)||content.partners.length>100||content.partners.some(p=>!p||(["name","fullName","logo","url"] as const).some(k=>typeof p[k]!=="string"||p[k].length>2000))) throw new Error();
    images.push(...content.partners.map(p=>p.logo).filter(Boolean));
    for(const value of images) if(value.startsWith("storage:")) {
      const storageId=ctx.db.system.normalizeId("_storage",value.slice(8));
      const asset=storageId?await ctx.db.query("media").withIndex("by_storageId",q=>q.eq("storageId",storageId)).unique():null;
      if(!asset) throw new Error();
    }
    if(!productsValid(content.loans,defaultWebsiteContent.loans)||!productsValid(content.savings,defaultWebsiteContent.savings)) throw new Error();
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
  const ids=[...new Set(contents.flatMap(content=>[...Object.values(content.copy),...content.board.map(p=>p.photo),...content.staff.map(p=>p.photo),...content.partners.map(p=>p.logo)].filter(value=>value.startsWith("storage:")).map(value=>value.slice(8))))];
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

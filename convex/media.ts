import { v, ConvexError } from "convex/values";
import { staffMutation, staffQuery, requirePermission } from "./lib/access";
export const uploadUrl=staffMutation({args:{},returns:v.string(),handler:async ctx=>{requirePermission(ctx.person,"content:edit");return await ctx.storage.generateUploadUrl();}});
export const register=staffMutation({args:{storageId:v.id("_storage")},returns:v.string(),handler:async(ctx,{storageId})=>{
  requirePermission(ctx.person,"content:edit");
  const file=await ctx.db.system.get(storageId);
  if(!file||file.size>2*1024*1024||!["image/png","image/jpeg","image/webp"].includes(file.contentType??"")) throw new ConvexError("Choose a PNG, JPEG or WebP image up to 2 MB.");
  if(!await ctx.db.query("media").withIndex("by_storageId",q=>q.eq("storageId",storageId)).unique()) await ctx.db.insert("media",{storageId,uploadedBy:ctx.person._id});
  return `storage:${storageId}`;
}});
export const url=staffQuery({args:{storageId:v.id("_storage")},returns:v.union(v.null(),v.string()),handler:async(ctx,{storageId})=>{requirePermission(ctx.person,"content:view");return ctx.storage.getUrl(storageId);}});
export const urls=staffQuery({args:{references:v.array(v.string())},returns:v.record(v.string(),v.union(v.string(),v.null())),handler:async(ctx,{references})=>{
  requirePermission(ctx.person,"content:view");
  if(references.length>100) throw new ConvexError("Too many images in this preview.");
  return Object.fromEntries(await Promise.all(references.map(async reference=>{
    const id=ctx.db.system.normalizeId("_storage",reference.slice(8));
    return [reference,id?await ctx.storage.getUrl(id):null];
  })));
}});

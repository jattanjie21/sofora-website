import { v, ConvexError } from "convex/values";
import { internalMutation } from "./_generated/server";
import { defaultWebsiteContent } from "../apps/web/src/data/websiteDefaults";
import { documents } from "../apps/portal/src/data/content";
import { slice } from "./content";

export const initialize=internalMutation({args:{administratorEmail:v.string(),invitationHash:v.string()},returns:v.null(),handler:async(ctx,args)=>{
  if(await ctx.db.query("staff").first()) throw new ConvexError("Workspace already initialized; existing data was preserved.");
  if(!/^[a-f0-9]{64}$/.test(args.invitationHash)) throw new ConvexError("Invalid activation hash.");
  const id=await ctx.db.insert("staff",{name:"Bakary Bojang",email:args.administratorEmail.toLowerCase(),loginEmail:args.administratorEmail.toLowerCase(),roles:["admin"],active:true});
  await ctx.db.insert("invitations",{staffId:id,hash:args.invitationHash,expiresAt:Date.now()+7*86400000});
  const at=new Date().toISOString();
  for(const doc of documents) {
    const payload=slice(defaultWebsiteContent,doc.id);
    await ctx.db.insert("pages",{key:doc.id,published:payload,revision:1,updatedAt:at,updatedBy:id});
  }
  await ctx.db.insert("counts",{key:"applications",value:{total:0,membership:0,loan:0,new:0,in_review:0,needs_information:0,recommended:0,approved:0,rejected:0}});
  await ctx.db.insert("counts",{key:"contact",value:{total:0,unread:0}});
  return null;
}});

// Ensures the contact-message counter exists on deployments created before the contact inbox shipped.
// Internal only: run with `pnpm exec convex run setup:ensureContactCounts`.
export const ensureContactCounts=internalMutation({args:{},returns:v.boolean(),handler:async ctx=>{
  if(await ctx.db.query("counts").withIndex("by_key",q=>q.eq("key","contact")).unique()) return false;
  await ctx.db.insert("counts",{key:"contact",value:{total:0,unread:0}});
  return true;
}});

// Replaces every website page with the default content, e.g. after the page structure changes.
// Internal only: run with `pnpm exec convex run setup:resetPages`.
export const resetPages=internalMutation({args:{},returns:v.number(),handler:async ctx=>{
  const admin=await ctx.db.query("staff").first();
  if(!admin) throw new ConvexError("Initialize the workspace first.");
  for(const page of await ctx.db.query("pages").take(100)) await ctx.db.delete(page._id);
  const at=new Date().toISOString();
  for(const doc of documents) await ctx.db.insert("pages",{key:doc.id,published:slice(defaultWebsiteContent,doc.id),revision:1,updatedAt:at,updatedBy:admin._id});
  return documents.length;
}});

// Adds a default row for any website page that has none (e.g. a newly added page), leaving existing pages untouched.
// Internal only: run with `pnpm exec convex run setup:addMissingPages`.
export const addMissingPages=internalMutation({args:{},returns:v.array(v.string()),handler:async ctx=>{
  const admin=await ctx.db.query("staff").first();
  if(!admin) throw new ConvexError("Initialize the workspace first.");
  const existing=new Set((await ctx.db.query("pages").take(100)).map(page=>page.key));
  const at=new Date().toISOString();
  const added=documents.filter(doc=>!existing.has(doc.id));
  for(const doc of added) await ctx.db.insert("pages",{key:doc.id,published:slice(defaultWebsiteContent,doc.id),revision:1,updatedAt:at,updatedBy:admin._id});
  return added.map(doc=>doc.id);
}});

// Adds an empty attachments list to applications saved before document uploads existed.
// Internal only: run with `pnpm exec convex run setup:backfillApplicationAttachments`.
export const backfillApplicationAttachments=internalMutation({args:{},returns:v.number(),handler:async ctx=>{
  let updated=0;
  for(const row of await ctx.db.query("applications").take(500)) {
    if(row.attachments) continue;
    await ctx.db.patch(row._id,{attachments:[]});
    updated+=1;
  }
  return updated;
}});

// Replaces the staff page people list with the default order from content.ts (other staff page fields unchanged).
// Internal only: run with `pnpm exec convex run setup:syncStaffFromDefaults`.
export const syncStaffFromDefaults=internalMutation({args:{},returns:v.null(),handler:async ctx=>{
  const admin=await ctx.db.query("staff").first();
  if(!admin) throw new ConvexError("Initialize the workspace first.");
  const page=await ctx.db.query("pages").withIndex("by_key",q=>q.eq("key","staff")).unique();
  if(!page) return null;
  const data=JSON.parse(page.published);
  data.staff=defaultWebsiteContent.staff;
  await ctx.db.patch(page._id,{published:JSON.stringify(data),revision:page.revision+1,updatedAt:new Date().toISOString(),updatedBy:admin._id});
  return null;
}});

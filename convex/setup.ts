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
  return null;
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

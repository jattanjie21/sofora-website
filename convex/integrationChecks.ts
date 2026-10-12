// Temporary, internal-only fixtures for the user-approved development checks.
// This module is removed from the deployment after verification.
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { role } from "./validators";
import { components } from "./_generated/api";
import { RateLimiter } from "@convex-dev/rate-limiter";
function guard(run: string) {
  if (process.env.CONVEX_SITE_URL !== "https://jovial-ptarmigan-163.eu-west-1.convex.site" || !/^check-[a-f0-9]{16}$/.test(run)) throw new Error("Development checks only");
}
const accountNames = ["admin", "editor", "officer", "combined"];
export const prepare = internalMutation({
  args: {run:v.string(), accounts:v.array(v.object({name:v.string(), hash:v.string(), roles:v.array(role)}))},
  returns: v.string(),
  handler: async (ctx, {run, accounts}) => {
    guard(run);
    const page = await ctx.db.query("pages").withIndex("by_key", q=>q.eq("key", "community")).unique();
    if (!page) throw new Error("Community must exist before this isolated check");
    for (const account of accounts) {
      if (!accountNames.includes(account.name)) throw new Error("Invalid fixture account");
      const email = `${run}-${account.name}@example.test`;
      const id = await ctx.db.insert("staff", {name:`Verification ${account.name}`, email, loginEmail:email, roles:account.roles, active:true});
      await ctx.db.insert("invitations", {staffId:id,hash:account.hash,expiresAt:Date.now()+3600000});
    }
    return JSON.stringify(page);
  }
});
export const cleanup = internalMutation({
  args: {run:v.string(), snapshot:v.string(), requestIds:v.array(v.string()), storageIds:v.array(v.id("_storage"))},
  returns:v.null(),
  handler: async (ctx, {run,snapshot,requestIds,storageIds}) => {
    guard(run);
    const people = (await Promise.all([...accountNames,"invited"].map(name=>ctx.db.query("staff").withIndex("by_loginEmail",q=>q.eq("loginEmail",`${run}-${name}@example.test`)).unique()))).filter(p=>p!==null);
    const ids = new Set(people.map(p=>p._id));
    const old = JSON.parse(snapshot);
    const page = await ctx.db.query("pages").withIndex("by_key",q=>q.eq("key","community")).unique();
    if (page && ids.has(page.updatedBy as typeof people[number]["_id"])) {
      const {_id, _creationTime, ...fields} = old;
      await ctx.db.replace(page._id, {...fields,revision:page.revision+1});
    }
    const counter = await ctx.db.query("counts").withIndex("by_key",q=>q.eq("key","applications")).unique();
    for (const requestId of requestIds) {
      const app = await ctx.db.query("applications").withIndex("by_requestId",q=>q.eq("requestId",requestId)).unique();
      if (!app) continue;
      if (!app.email.startsWith(run+"-")) throw new Error("Cannot delete a real application");
      if (counter) {counter.value.total--;counter.value[app.kind]--;counter.value[app.status]--;}
      for (const note of [false,true]) for(const row of await ctx.db.query("activity").withIndex("by_entity_and_note",q=>q.eq("entity",app._id).eq("note",note)).take(100)) await ctx.db.delete(row._id);
      await ctx.db.delete(app._id);
    }
    if(counter) await ctx.db.patch(counter._id,{value:counter.value});
    for (const scope of ["content","staff"] as const) for(const row of await ctx.db.query("activity").withIndex("by_scope",q=>q.eq("scope",scope)).take(500)) if(ids.has(row.actorId as typeof people[number]["_id"])) await ctx.db.delete(row._id);
    for (const person of people) {
      for (const invitation of await ctx.db.query("invitations").withIndex("by_staffId",q=>q.eq("staffId",person._id)).take(10)) await ctx.db.delete(invitation._id);
      if(person.userId) {
        for (const session of await ctx.db.query("authSessions").withIndex("userId",q=>q.eq("userId",person.userId!)).take(50)) {
          for (const token of await ctx.db.query("authRefreshTokens").withIndex("sessionId",q=>q.eq("sessionId",session._id)).take(100)) await ctx.db.delete(token._id);
          await ctx.db.delete(session._id);
        }
        for (const account of await ctx.db.query("authAccounts").withIndex("userIdAndProvider",q=>q.eq("userId",person.userId!)).take(10)) {
          for(const code of await ctx.db.query("authVerificationCodes").withIndex("accountId",q=>q.eq("accountId",account._id)).take(10)) await ctx.db.delete(code._id);
          await ctx.db.delete(account._id);
        }
        await ctx.db.delete(person.userId);
      }
      await ctx.db.delete(person._id);
    }
    for (const row of await ctx.db.query("authRateLimits").take(500)) if(row.identifier.includes(run)) await ctx.db.delete(row._id);
    for(const storageId of storageIds) {
      const media=await ctx.db.query("media").withIndex("by_storageId",q=>q.eq("storageId",storageId)).unique();
      if(media && !ids.has(media.uploadedBy)) throw new Error("Cannot delete another staff member’s image");
      if(media) await ctx.db.delete(media._id);
      await ctx.storage.delete(storageId);
    }
    const limiter = new RateLimiter(components.rateLimiter);
    for(const kind of ["membership","loan"]) await limiter.reset(ctx,"emailSubmissions",{key:`${run}-${kind}@example.test`});
    return null;
  }
});
export const verifyClean = internalQuery({args:{},returns:v.string(),handler:async ctx=>JSON.stringify({staff:(await ctx.db.query("staff").take(200)).map(p=>({email:p.loginEmail,activated:!!p.userId})),users:(await ctx.db.query("users").take(100)).length,applications:(await ctx.db.query("applications").take(100)).length,activity:(await ctx.db.query("activity").take(100)).length,media:(await ctx.db.query("media").take(100)).length,pages:(await ctx.db.query("pages").take(10)).map(p=>p.key),counts:(await ctx.db.query("counts").first())?.value})});

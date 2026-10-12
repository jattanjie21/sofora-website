// Development-only login: username "admin", password "admin".
// Runs only on deployments with the DEV_LOGINS=true environment variable (set on the dev deployment only).
import { v } from "convex/values";
import { createAccount, modifyAccountCredentials } from "@convex-dev/auth/server";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { hash } from "./lib/access";

export const DEV_USERNAME = "admin";
export const DEV_ADMIN_EMAIL = "admin@sofora.test";
const DEV_PASSWORD = "admin";

export function devLoginsEnabled() {
  return process.env.DEV_LOGINS === "true";
}

export const prepareAdmin = internalMutation({args:{invitationHash:v.string()},returns:v.union(v.literal("activated"),v.literal("invited")),handler:async(ctx,{invitationHash})=>{
  if(!await ctx.db.query("pages").first()) throw new Error("Initialise the workspace with setup:initialize first.");
  let person=await ctx.db.query("staff").withIndex("by_loginEmail",q=>q.eq("loginEmail",DEV_ADMIN_EMAIL)).unique();
  if(!person) {
    const id=await ctx.db.insert("staff",{name:"Dev Admin",email:DEV_ADMIN_EMAIL,loginEmail:DEV_ADMIN_EMAIL,roles:["admin"],active:true});
    person=(await ctx.db.get(id))!;
  } else if(!person.active||!person.roles.includes("admin")) {
    await ctx.db.patch(person._id,{active:true,roles:[...new Set([...person.roles,"admin" as const])]});
  }
  if(person.userId) return "activated";
  await ctx.db.insert("invitations",{staffId:person._id,hash:invitationHash,expiresAt:Date.now()+60_000});
  return "invited";
}});

export const seed = internalAction({args:{},returns:v.string(),handler:async ctx=>{
  if(!devLoginsEnabled()) throw new Error("Dev logins are disabled on this deployment (DEV_LOGINS is not true).");
  const token=[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,"0")).join("");
  const status=await ctx.runMutation(internal.devLogins.prepareAdmin,{invitationHash:await hash(token)});
  const account={id:DEV_ADMIN_EMAIL,secret:DEV_PASSWORD};
  if(status==="activated") await modifyAccountCredentials(ctx,{provider:"password",account});
  // auth.ts's createOrUpdateUser reads the invitation from the profile, just as it does for the activation-link sign-up.
  else await createAccount(ctx,{provider:"password",account,profile:{email:DEV_ADMIN_EMAIL,invitation:token} as {email:string}});
  return `Dev login ready: ${DEV_USERNAME} / ${DEV_PASSWORD}`;
}});

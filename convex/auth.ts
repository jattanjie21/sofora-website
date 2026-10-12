import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { email, hash } from "./lib/access";
import type { MutationCtx } from "./_generated/server";
import { DEV_ADMIN_EMAIL, DEV_USERNAME, devLoginsEnabled } from "./devLogins";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({
    profile(params) {
      const login = String(params.email ?? "").trim();
      const id = devLoginsEnabled() && login === DEV_USERNAME ? DEV_ADMIN_EMAIL : login;
      return {email:email(id), invitation:String(params.invitation ?? "")};
    },
    validatePasswordRequirements(password) {
      if (password.length < 12 || password.length > 128) throw new ConvexError("Use a password between 12 and 128 characters.");
    },
  })],
  callbacks: {
    async createOrUpdateUser(rawCtx, args) {
      const ctx = rawCtx as MutationCtx;
      if (args.existingUserId) return args.existingUserId;
      const token = String(args.profile.invitation ?? "");
      if (token.length < 32 || token.length > 200) throw new ConvexError("A valid staff activation link is required.");
      const awaitHash = await hash(token);
      const invitation = await ctx.db.query("invitations").withIndex("by_hash",q=>q.eq("hash",awaitHash)).unique();
      const person = invitation ? await ctx.db.get(invitation.staffId) : null;
      if (!invitation || invitation.expiresAt < Date.now() || !person?.active || person.userId || person.loginEmail !== args.profile.email)
        throw new ConvexError("This activation link is invalid or expired.");
      const userId = await ctx.db.insert("users",{name:person.name,email:person.loginEmail});
      await ctx.db.patch(person._id,{userId});
      await ctx.db.delete(invitation._id);
      return userId;
    },
    async beforeSessionCreation(rawCtx,{userId}) {
      const ctx=rawCtx as MutationCtx;
      const person=await ctx.db.query("staff").withIndex("by_userId",q=>q.eq("userId",userId)).unique();
      if (!person?.active) throw new ConvexError("This staff account is inactive.");
    },
  },
});

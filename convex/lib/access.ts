import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { mutation, query, type QueryCtx, type MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { can, type Permission } from "../../apps/portal/src/data/types";

export function dto(person: Doc<"staff">) {
  return {id:person._id,name:person.name,email:person.email,loginEmail:person.loginEmail,roles:person.roles,active:person.active,activated:!!person.userId};
}
export async function currentStaff(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const person = await ctx.db.query("staff").withIndex("by_userId", q=>q.eq("userId",userId)).unique();
  return person?.active ? person : null;
}
async function context(ctx: QueryCtx) {
  const person = await currentStaff(ctx);
  if (!person) throw new ConvexError("Active staff access required.");
  return {person};
}
export const staffQuery = customQuery(query,customCtx(context));
export const staffMutation = customMutation(mutation,customCtx(context));
export function requirePermission(person: Doc<"staff">, permission: Permission) {
  if (!can(dto(person),permission)) throw new ConvexError("Your role cannot perform this action.");
}
export function text(value:string,label:string,max=4000) {
  const result=value.trim();
  if (!result || result.length>max) throw new ConvexError(`${label} is required and must be under ${max} characters.`);
  return result;
}
export function email(value:string) {
  const result=text(value,"Email",254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new ConvexError("Enter a valid email address.");
  return result;
}
export async function hash(value:string) {
  const bytes = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
export async function log(ctx: MutationCtx, actorId:string, scope:"content"|"applications"|"staff", entity:string, message:string, note=false) {
  const item={id:crypto.randomUUID(),actorId,scope,entity,message,note,at:new Date().toISOString()};
  await ctx.db.insert("activity",item);
  return item;
}
export function activityDto(item:Doc<"activity">) {
  return {id:item.id,actorId:item.actorId,scope:item.scope,message:item.message,at:item.at};
}

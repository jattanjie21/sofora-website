import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { role, documentKey, applicationFields, activity, counts } from "./validators";

export default defineSchema({
  ...authTables,
  staff: defineTable({userId:v.optional(v.id("users")),name:v.string(),email:v.string(),loginEmail:v.string(),roles:v.array(role),active:v.boolean()})
    .index("by_userId",["userId"]).index("by_loginEmail",["loginEmail"]).index("by_email",["email"]).index("by_active",["active"]),
  invitations: defineTable({staffId:v.id("staff"),hash:v.string(),expiresAt:v.number()}).index("by_hash",["hash"]).index("by_staffId",["staffId"]),
  pages: defineTable({key:documentKey,published:v.string(),revision:v.number(),updatedAt:v.string(),updatedBy:v.string()}).index("by_key",["key"]),
  applications: defineTable({...applicationFields,requestId:v.string()}).index("by_requestId",["requestId"]).index("by_status",["status"]),
  activity: defineTable({...activity.fields,entity:v.string(),note:v.boolean()}).index("by_scope",["scope"]).index("by_entity_and_note",["entity","note"]),
  counts: defineTable({key:v.literal("applications"),value:counts}).index("by_key",["key"]),
  media: defineTable({storageId:v.id("_storage"),uploadedBy:v.id("staff")}).index("by_storageId",["storageId"]),
});

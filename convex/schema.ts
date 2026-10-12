import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { role, documentKey, applicationFields, activity, countKey, countValue, applicationAttachmentRole } from "./validators";

export default defineSchema({
  ...authTables,
  staff: defineTable({userId:v.optional(v.id("users")),name:v.string(),email:v.string(),loginEmail:v.string(),roles:v.array(role),active:v.boolean()})
    .index("by_userId",["userId"]).index("by_loginEmail",["loginEmail"]).index("by_email",["email"]).index("by_active",["active"]),
  invitations: defineTable({staffId:v.id("staff"),hash:v.string(),expiresAt:v.number()}).index("by_hash",["hash"]).index("by_staffId",["staffId"]),
  pages: defineTable({key:documentKey,published:v.string(),revision:v.number(),updatedAt:v.string(),updatedBy:v.string()}).index("by_key",["key"]),
  applications: defineTable({...applicationFields,requestId:v.string()}).index("by_requestId",["requestId"]).index("by_status",["status"]),
  activity: defineTable({...activity.fields,entity:v.string(),note:v.boolean()}).index("by_scope",["scope"]).index("by_entity_and_note",["entity","note"]),
  contactMessages: defineTable({reference:v.string(),name:v.string(),email:v.string(),phone:v.string(),topic:v.string(),message:v.string(),submittedAt:v.string(),read:v.boolean(),requestId:v.string()}).index("by_requestId",["requestId"]),
  counts: defineTable({key:countKey,value:countValue}).index("by_key",["key"]),
  media: defineTable({storageId:v.id("_storage"),uploadedBy:v.id("staff")}).index("by_storageId",["storageId"]),
  applicationUploads: defineTable({requestId:v.string(), role:applicationAttachmentRole, storageId:v.id("_storage")}).index("by_requestId_and_role",["requestId","role"]),
  // Portal settings stored as JSON, like pages (key "email": EmailSettings from apps/portal/src/data/email.ts).
  settings: defineTable({key:v.literal("email"),value:v.string(),updatedAt:v.string(),updatedBy:v.string()}).index("by_key",["key"]),
  // One row per email queued through Resend; delivery status is read from the Resend component.
  // Hashes of recent website submissions, so the same details can't be sent twice (lib/submissions.ts).
  submissionFingerprints: defineTable({hash:v.string(),reference:v.string(),at:v.number()}).index("by_hash",["hash"]),
  emailLog: defineTable({emailId:v.string(),to:v.string(),subject:v.string(),template:v.string(),reference:v.string(),at:v.string()}),
});

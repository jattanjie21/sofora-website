import { v } from "convex/values";

export const role = v.union(v.literal("admin"), v.literal("editor"), v.literal("officer"));
export const documentKey = v.union(...["home", "about", "savings", "loans", "membership", "community", "contact", "shared", "calculator"].map(v.literal));
export const status = v.union(v.literal("new"), v.literal("in_review"), v.literal("needs_information"), v.literal("recommended"), v.literal("approved"), v.literal("rejected"));
export const kind = v.union(v.literal("membership"), v.literal("loan"));
export const activity = v.object({id: v.string(), scope: v.union(v.literal("content"), v.literal("applications"), v.literal("staff")), at: v.string(), actorId: v.string(), message: v.string()});
export const staff = v.object({id: v.id("staff"), name: v.string(), email: v.string(), loginEmail: v.string(), roles: v.array(role), active: v.boolean(), activated: v.boolean()});
export const applicationInput = v.object({kind, name:v.string(), email:v.string(), phone:v.string(), address:v.string(), occupation:v.string(), purpose:v.string(), membershipType:v.union(v.literal("personal"),v.literal("group"),v.literal("children")), product:v.string(), amount:v.number(), months:v.number(), memberNumber:v.string(), assigneeId:v.union(v.literal(""),v.id("staff"))});
export const applicationFields = {
  ...applicationInput.fields, reference:v.string(), submittedAt:v.string(), status,
  source:v.union(v.literal("website"),v.literal("staff")), revision:v.number(),
  informationRequest:v.string(),
  recommendation:v.union(v.null(),v.object({decision:v.union(v.literal("approve"),v.literal("reject")),reason:v.string(),actorId:v.id("staff"),at:v.string()})),
  decision:v.union(v.null(),v.object({outcome:v.union(v.literal("approved"),v.literal("rejected")),reason:v.string(),actorId:v.id("staff"),at:v.string()})),
};
export const application = v.object({...applicationFields,id:v.id("applications"),notes:v.array(activity),history:v.array(activity)});
export const applicationAction = v.union(
  v.object({type:v.literal("assign"),userId:v.union(v.literal(""),v.id("staff"))}),
  v.object({type:v.literal("note"),text:v.string()}),
  v.object({type:v.literal("review")}),
  v.object({type:v.literal("request_information"),text:v.string()}),
  v.object({type:v.literal("recommend"),decision:v.union(v.literal("approve"),v.literal("reject")),text:v.string()}),
  v.object({type:v.literal("decide"),decision:v.union(v.literal("approved"),v.literal("rejected")),text:v.string()}),
);
export const counts = v.object({total:v.number(), membership:v.number(), loan:v.number(),new:v.number(),in_review:v.number(),needs_information:v.number(),recommended:v.number(),approved:v.number(),rejected:v.number()});

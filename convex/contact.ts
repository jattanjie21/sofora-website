import { v, ConvexError } from "convex/values";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { DAY } from "@convex-dev/rate-limiter";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { contactInput, contactMessage, contactCounts } from "./validators";
import { staffMutation, staffQuery, requirePermission, text, email, log } from "./lib/access";
import { contactSubmitted } from "./email";
import { guardSubmission, rememberSubmission } from "./lib/submissions";
import type { Infer } from "convex/values";


async function counter(ctx: MutationCtx) {
  let row = await ctx.db.query("counts").withIndex("by_key", (q) => q.eq("key", "contact")).unique();
  if (!row) {
    const id = await ctx.db.insert("counts", { key: "contact", value: { total: 0, unread: 0 } });
    row = (await ctx.db.get(id))!;
  }
  return row;
}

function cleaned(value: Infer<typeof contactInput>) {
  const phone = value.phone.trim();
  const result = {
    name: text(value.name, "Name", 150),
    email: email(value.email),
    phone,
    topic: text(value.topic, "Reason for contacting us", 120),
    message: text(value.message, "Message", 4000),
  };
  if (phone && !/^[+()\d\s-]{5,30}$/.test(phone)) throw new ConvexError("Enter a valid phone number.");
  return result;
}

function summary(row: Doc<"contactMessages">) {
  const { _id, _creationTime, requestId, ...fields } = row;
  void _creationTime;
  void requestId;
  return { ...fields, id: _id };
}

export const submit = mutation({
  args: { input: contactInput, requestId: v.string(), website: v.string(), elapsedMs: v.number() },
  returns: v.object({ reference: v.string() }),
  handler: async (ctx, args) => {
    if (args.website) throw new ConvexError("Please check your message and try again.");
    if (!/^[0-9a-f-]{36}$/.test(args.requestId)) throw new ConvexError("Invalid submission identifier.");
    const existing = await ctx.db.query("contactMessages").withIndex("by_requestId", (q) => q.eq("requestId", args.requestId)).unique();
    if (existing) return { reference: existing.reference };
    const values = cleaned(args.input);
    // Bot timing, rate limits and the same message sent again within a day.
    const fingerprint = await guardSubmission(ctx, { what: "message", email: values.email, parts: [values.name, values.topic, values.message], elapsedMs: args.elapsedMs, windowMs: DAY });
    const row = await counter(ctx);
    const value = row.value as Infer<typeof contactCounts>;
    const submittedAt = new Date().toISOString();
    const reference = `CT-${submittedAt.slice(0, 4)}-${String(value.total + 1).padStart(6, "0")}`;
    const id = await ctx.db.insert("contactMessages", { ...values, reference, submittedAt, read: false, requestId: args.requestId });
    await ctx.db.patch(row._id, { value: { total: value.total + 1, unread: value.unread + 1 } });
    await rememberSubmission(ctx, fingerprint, reference);
    await log(ctx, "website", "contact", id, `Received ${reference} from the website`);
    await contactSubmitted(ctx, (await ctx.db.get(id))!);
    return { reference };
  },
});

export const list = staffQuery({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(contactMessage),
  handler: async (ctx, args) => {
    requirePermission(ctx.person, "applications:view");
    const result = await ctx.db.query("contactMessages").order("desc").paginate(args.paginationOpts);
    return { ...result, page: result.page.map(summary) };
  },
});

export const detail = staffQuery({
  args: { id: v.id("contactMessages") },
  returns: v.union(v.null(), contactMessage),
  handler: async (ctx, { id }) => {
    requirePermission(ctx.person, "applications:view");
    const row = await ctx.db.get(id);
    return row ? summary(row) : null;
  },
});

export const totals = staffQuery({
  args: {},
  returns: contactCounts,
  handler: async (ctx) => {
    requirePermission(ctx.person, "applications:view");
    const row = await ctx.db.query("counts").withIndex("by_key", (q) => q.eq("key", "contact")).unique();
    return (row?.value as Infer<typeof contactCounts> | undefined) ?? { total: 0, unread: 0 };
  },
});

export const markRead = staffMutation({
  args: { id: v.id("contactMessages") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    requirePermission(ctx.person, "applications:view");
    const row = await ctx.db.get(id);
    if (!row || row.read) return null;
    await ctx.db.patch(id, { read: true });
    const counterRow = await ctx.db.query("counts").withIndex("by_key", (q) => q.eq("key", "contact")).unique();
    if (counterRow) {
      const value = counterRow.value as Infer<typeof contactCounts>;
      await ctx.db.patch(counterRow._id, { value: { ...value, unread: Math.max(0, value.unread - 1) } });
    }
    return null;
  },
});

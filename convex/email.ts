import { v, ConvexError } from "convex/values";
import { Resend, type EmailId } from "@convex-dev/resend";
import { components } from "./_generated/api";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { staffMutation, staffQuery, requirePermission, email as validEmail } from "./lib/access";
import {
  emailPattern,
  emailTemplateKeys,
  emailTemplates,
  teamLists,
  withEmailDefaults,
  type EmailSettings,
  type EmailTemplate,
  type TeamList,
} from "../apps/portal/src/data/email";

// Emails go through the Resend component (queued, retried, sent once). Environment variables:
// RESEND_API_KEY (required to send; without it nothing is sent and forms still work),
// RESEND_WEBHOOK_SECRET (delivery status via /resend-webhook), EMAIL_FROM (default below),
// EMAIL_LIVE=true on production only. Anywhere else every email goes to EMAIL_TEST_TO
// (or Resend's delivered@resend.dev) so testing never emails a real applicant.
// SITE_URL (the portal address, also used by auth) builds the "Open in portal" links.
export const resend = new Resend(components.resend, { testMode: false });

const from = () => process.env.EMAIL_FROM || "Sofora CCU <noreply@soforaccu.com>";
const live = () => process.env.EMAIL_LIVE === "true";
const portalUrl = () => (process.env.SITE_URL ?? "").replace(/\/$/, "");

async function loadSettings(ctx: QueryCtx) {
  const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "email")).unique();
  return withEmailDefaults(row ? (JSON.parse(row.value) as Partial<EmailSettings>) : null);
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(name|reference|type)\}/g, (_, key: string) => values[key] ?? "");

type Message = {
  heading: string;
  intro: string;
  details: [string, string][];
  note?: { title: string; text: string };
  button?: { label: string; url: string };
  footer: string;
};

// Plain table layout with inline styles: the only thing email clients render reliably.
function render(message: Message) {
  const paragraphs = (text: string) =>
    text
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1f2933">${escape(p).replace(/\n/g, "<br>")}</p>`)
      .join("");
  const rows = message.details
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;font-size:13px;color:#5b6b78;width:140px;vertical-align:top">${escape(label)}</td><td style="padding:8px 0;font-size:14px;color:#111;font-weight:600">${escape(value)}</td></tr>`,
    )
    .join("");
  const logo = process.env.CONVEX_SITE_URL ? `${process.env.CONVEX_SITE_URL.replace(/\/$/, "")}/email/logo.png` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#eef3f7;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0d78d0;padding:20px 28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${logo ? `<td style="padding-right:12px;vertical-align:middle"><img src="${escape(logo)}" width="44" height="44" alt="Sofora CCU logo" style="display:block;border:0"></td>` : ""}<td style="vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px">Sofora CCU</td></tr></table></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111">${escape(message.heading)}</h1>
${paragraphs(message.intro)}
${message.note ? `<div style="margin:6px 0 18px;padding:14px 16px;background:#fff7e9;border-radius:10px;border:1px solid #ecdcb9"><p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#8a5d14">${escape(message.note.title)}</p>${paragraphs(message.note.text)}</div>` : ""}
${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;border-top:1px solid #e4e9e9;border-bottom:1px solid #e4e9e9">${rows}</table>` : ""}
${message.button ? `<p style="margin:22px 0 6px"><a href="${escape(message.button.url)}" style="display:inline-block;background:#0d78d0;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:10px">${escape(message.button.label)}</a></p>` : ""}
</td></tr>
<tr><td style="padding:18px 28px;background:#f6f9fb;font-size:12px;line-height:1.6;color:#5b6b78">${escape(message.footer)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    message.heading,
    "",
    message.intro,
    ...(message.note ? ["", `${message.note.title}:`, message.note.text] : []),
    "",
    ...message.details.map(([label, value]) => `${label}: ${value}`),
    ...(message.button ? ["", `${message.button.label}: ${message.button.url}`] : []),
    "",
    message.footer,
  ].join("\n");
  return { html, text };
}

const memberFooter =
  "Sofora Cooperative Credit Union · People helping people. You're receiving this email because of a form you sent on our website.";
const teamFooter = "Sent automatically by the Sofora website. Change who receives these emails in the staff portal under Settings.";

type Send = {
  template: EmailTemplate;
  to: string[];
  values: { name: string; reference: string; type: string };
  details: [string, string][];
  note?: Message["note"];
  button?: Message["button"];
  team?: boolean;
  // Test emails from Settings skip the redirect: an admin typed the address.
  test?: boolean;
};

async function send(ctx: MutationCtx, settings: EmailSettings, item: Send) {
  if (!process.env.RESEND_API_KEY) return 0;
  if (!item.test && !settings.enabled[item.template]) return 0;
  const recipients = [...new Set(item.to.map((a) => a.trim().toLowerCase()).filter((a) => emailPattern.test(a)))];
  if (!recipients.length) return 0;
  const wording = settings.wording[item.template];
  const subject = fill(wording.subject, item.values);
  const { html, text } = render({
    heading: subject.replace(/\s*\([A-Z]{2}-\d{4}-\d+\)$/, ""),
    intro: fill(wording.intro, item.values),
    details: item.details,
    note: item.note,
    button: item.button,
    footer: item.team ? teamFooter : memberFooter,
  });
  const redirect = !item.test && !live();
  const to = redirect ? [process.env.EMAIL_TEST_TO || "delivered@resend.dev"] : recipients;
  const finalSubject = item.test ? `[Test] ${subject}` : redirect ? `[Test → ${recipients.join(", ")}] ${subject}` : subject;
  const replyTo = !item.team && emailPattern.test(settings.replyTo) ? [settings.replyTo] : undefined;
  let emailId: EmailId;
  try {
    emailId = await resend.sendEmail(ctx, { from: from(), to, subject: finalSubject, html, text, replyTo });
  } catch (error) {
    // Never fail the form or the staff action because of email.
    console.error("Email could not be queued", item.template, error);
    return 0;
  }
  await ctx.db.insert("emailLog", {
    emailId,
    to: to.join(", "),
    subject: finalSubject,
    template: item.template,
    reference: item.values.reference,
    at: new Date().toISOString(),
  });
  return 1;
}

const membershipTypes = { personal: "Personal", group: "Group (Kafo)", children: "Children" } as const;
const typeLabel = (kind: Doc<"applications">["kind"]) => (kind === "loan" ? "loan" : "membership");
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// Called from applications.ts when the website form creates an application.
export async function applicationSubmitted(ctx: MutationCtx, row: Doc<"applications">) {
  const settings = await loadSettings(ctx);
  const values = { name: row.name, reference: row.reference, type: typeLabel(row.kind) };
  await send(ctx, settings, {
    template: "applicationReceived",
    to: [row.email],
    values,
    details: [
      ["Reference", row.reference],
      ["Application", row.kind === "loan" ? "Loan" : "Membership"],
      ["Submitted", date(row.submittedAt)],
    ],
  });
  await send(ctx, settings, {
    template: "teamApplication",
    to: settings.team[row.kind],
    values,
    team: true,
    details: [
      ["Reference", row.reference],
      ["Application", row.kind === "loan" ? "Loan" : "Membership"],
      ...(row.kind === "membership" ? [["Membership type", membershipTypes[row.membershipType]] as [string, string]] : []),
      ["Name", row.name],
      ["Phone", row.phone],
      ["Email", row.email],
    ],
    button: portalUrl() ? { label: "Open in the staff portal", url: `${portalUrl()}/applications/${row._id}` } : undefined,
  });
}

// Called from applications.ts after "Request information" or a final decision.
export async function applicationStatusChanged(ctx: MutationCtx, row: Doc<"applications">) {
  const template = row.status === "needs_information" ? "informationRequested" : row.status === "approved" ? "approved" : row.status === "rejected" ? "rejected" : null;
  if (!template) return;
  const settings = await loadSettings(ctx);
  await send(ctx, settings, {
    template,
    to: [row.email],
    values: { name: row.name, reference: row.reference, type: typeLabel(row.kind) },
    details: [
      ["Reference", row.reference],
      ["Application", row.kind === "loan" ? "Loan" : "Membership"],
    ],
    note: template === "informationRequested" && row.informationRequest ? { title: "What we need", text: row.informationRequest } : undefined,
  });
}

// Called from contact.ts when the website contact form is sent.
export async function contactSubmitted(ctx: MutationCtx, row: Doc<"contactMessages">) {
  const settings = await loadSettings(ctx);
  const values = { name: row.name, reference: row.reference, type: "contact" };
  await send(ctx, settings, {
    template: "contactReceived",
    to: [row.email],
    values,
    details: [
      ["Reference", row.reference],
      ["Topic", row.topic],
    ],
  });
  await send(ctx, settings, {
    template: "teamContact",
    to: settings.team.contact,
    values,
    team: true,
    details: [
      ["Reference", row.reference],
      ["Name", row.name],
      ["Topic", row.topic],
      ["Email", row.email],
      ...(row.phone ? [["Phone", row.phone] as [string, string]] : []),
    ],
    button: portalUrl() ? { label: "Open in the staff portal", url: `${portalUrl()}/contact/${row._id}` } : undefined,
  });
}

const wordingEntry = v.object({ subject: v.string(), intro: v.string() });
const settingsValue = v.object({
  team: v.object({ membership: v.array(v.string()), loan: v.array(v.string()), contact: v.array(v.string()) }),
  replyTo: v.string(),
  enabled: v.record(v.string(), v.boolean()),
  wording: v.record(v.string(), wordingEntry),
});
const status = v.object({
  configured: v.boolean(),
  live: v.boolean(),
  testRecipient: v.string(),
  from: v.string(),
  webhook: v.boolean(),
});

export const settings = staffQuery({
  args: {},
  returns: v.object({ value: settingsValue, status }),
  handler: async (ctx) => {
    requirePermission(ctx.person, "staff:manage");
    return {
      value: await loadSettings(ctx),
      status: {
        configured: !!process.env.RESEND_API_KEY,
        live: live(),
        testRecipient: process.env.EMAIL_TEST_TO || "delivered@resend.dev",
        from: from(),
        webhook: !!process.env.RESEND_WEBHOOK_SECRET,
      },
    };
  },
});

export const saveSettings = staffMutation({
  args: { value: settingsValue },
  returns: v.null(),
  handler: async (ctx, { value }) => {
    requirePermission(ctx.person, "staff:manage");
    const team = {} as EmailSettings["team"];
    for (const list of Object.keys(teamLists) as TeamList[]) {
      const addresses = [...new Set(value.team[list].map((a) => a.trim().toLowerCase()).filter(Boolean))];
      if (addresses.length > 20) throw new ConvexError(`Add at most 20 addresses for ${teamLists[list].toLowerCase()}.`);
      team[list] = addresses.map(validEmail);
    }
    const replyTo = value.replyTo.trim() ? validEmail(value.replyTo) : "";
    const enabled = {} as EmailSettings["enabled"];
    const wording = {} as EmailSettings["wording"];
    for (const key of emailTemplateKeys) {
      enabled[key] = value.enabled[key] ?? true;
      const subject = (value.wording[key]?.subject ?? "").trim() || emailTemplates[key].subject;
      const intro = (value.wording[key]?.intro ?? "").trim() || emailTemplates[key].intro;
      if (subject.length > 200 || intro.length > 3000) throw new ConvexError(`The wording for "${emailTemplates[key].label}" is too long.`);
      wording[key] = { subject, intro };
    }
    const stored = JSON.stringify({ team, replyTo, enabled, wording } satisfies EmailSettings);
    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "email")).unique();
    const meta = { value: stored, updatedAt: new Date().toISOString(), updatedBy: ctx.person._id };
    if (row) await ctx.db.patch(row._id, meta);
    else await ctx.db.insert("settings", { key: "email", ...meta });
    return null;
  },
});

export const sendTest = staffMutation({
  args: { to: v.string(), template: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    requirePermission(ctx.person, "staff:manage");
    if (!process.env.RESEND_API_KEY) throw new ConvexError("Email isn't connected yet: RESEND_API_KEY is not set on the server.");
    const template = (emailTemplateKeys as string[]).includes(args.template) ? (args.template as EmailTemplate) : "applicationReceived";
    const team = template === "teamApplication" || template === "teamContact";
    const sent = await send(ctx, await loadSettings(ctx), {
      template,
      to: [validEmail(args.to)],
      test: true,
      team,
      values: { name: "Awa Jallow", reference: "LN-2026-000123", type: "loan" },
      details: [
        ["Reference", "LN-2026-000123"],
        ["Application", "Loan"],
        ["Name", "Awa Jallow (sample)"],
      ],
      note: template === "informationRequested" ? { title: "What we need", text: "A copy of your latest payslip." } : undefined,
      button: team && portalUrl() ? { label: "Open in the staff portal", url: portalUrl() } : undefined,
    });
    if (!sent) throw new ConvexError("The test email could not be queued. Check the server logs.");
    return null;
  },
});

export const recent = staffQuery({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("emailLog"),
      to: v.string(),
      subject: v.string(),
      template: v.string(),
      reference: v.string(),
      at: v.string(),
      status: v.string(),
      error: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    requirePermission(ctx.person, "staff:manage");
    const rows = await ctx.db.query("emailLog").order("desc").take(30);
    return Promise.all(
      rows.map(async (row) => {
        const state = await resend.status(ctx, row.emailId as EmailId);
        const label = !state
          ? "unknown"
          : state.failed
            ? "failed"
            : state.complained
              ? "spam"
              : state.status;
        return {
          id: row._id,
          to: row.to,
          subject: row.subject,
          template: row.template,
          reference: row.reference,
          at: row.at,
          status: label,
          error: state?.errorMessage ?? null,
        };
      }),
    );
  },
});

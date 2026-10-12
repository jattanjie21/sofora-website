import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { resend } from "./email";
import { emailLogoPng } from "./lib/emailLogo";

const http = httpRouter();

auth.addHttpRoutes(http);

// Resend delivery events (delivered, bounced, spam) for the email log on the Settings page.
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => resend.handleResendEventWebhook(ctx, req)),
});

// The logo in email headers (see convex/email.ts).
http.route({
  path: "/email/logo.png",
  method: "GET",
  handler: httpAction(async () =>
    new Response(Uint8Array.from(atob(emailLogoPng), (c) => c.charCodeAt(0)), {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    }),
  ),
});

export default http;

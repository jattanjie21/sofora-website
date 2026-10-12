import { ConvexError } from "convex/values";

// Turns any error from Convex, sign-in, uploads or the network into a sentence people can act on.
// Our own server checks throw ConvexError("…") with a readable message, which is shown as is.
// Everything else (stack traces, internal codes) is mapped here, never shown raw.
// Used by the website forms and the portal's useFeedback().
export function readableError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ConvexError) {
    if (typeof error.data === "string") return error.data;
    const data = error.data as { kind?: string; retryAfter?: number } | null;
    if (data?.kind === "RateLimited") return `Too many attempts. Please try again in ${wait(data.retryAfter ?? 60000)}.`;
    return fallback;
  }
  const message = error instanceof Error ? error.message : String(error ?? "");
  for (const [pattern, text] of known) if (pattern.test(message)) return text;
  console.error(error);
  return fallback;
}

const known: [RegExp, string][] = [
  [/InvalidAccountId|InvalidSecret|Invalid credentials/i, "That email or password isn't right. Check them and try again."],
  [/TooManyFailedAttempts/i, "Too many failed sign-in attempts. Please wait a few minutes before trying again."],
  [/Dev logins are disabled/i, "Usernames only work on the test site. Sign in with your email address."],
  [/Failed to fetch|NetworkError|Load failed|Connection lost|WebSocket|ECONNREFUSED|network/i, "We can't reach the server. Check your internet connection and try again."],
  [/Request ID: .*Server Error|^Server Error/i, "Something went wrong on our side. Please try again in a moment."],
  [/too large|payload|413/i, "That file is too large. Choose a smaller one."],
];

function wait(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return minutes >= 120 ? `${Math.ceil(minutes / 60)} hours` : `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

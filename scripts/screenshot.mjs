// `pnpm screenshot <path> [out.png] [width] [options]`: screenshot a website or portal page. Needs `npm start`
// running and Google Chrome installed (or CHROME_PATH set).
//
// By default it renders a public page through the portal's /preview route with the default content in
// apps/web/src/data (no Convex needed, so it works even if the browser can't reach the backend).
//
//   --live            public site at :5173 with the real content from Convex
//   --portal          portal page at :5174, signed in as admin/admin (dev login)
//   --loading         capture the loading skeleton (holds back content / stalls the Convex connection)
//   --widths=1440,390 one screenshot per width; `out` gets a -<width> suffix
//   --viewport        only the first screen instead of the full page
//   --selector=.css   only this element (first match)
//
// Examples:
//   pnpm screenshot /services/ out.png 390
//   pnpm screenshot /contact-us/ out.png --live --widths=1440,390
//   pnpm screenshot /applications out.png --portal
//   pnpm screenshot / out.png --portal --loading
import { chromium } from "playwright-core";
import { resolve } from "node:path";
import { root } from "./processes.mjs";

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((arg) => arg.startsWith("--")).map((arg) => {
    const [key, value] = arg.slice(2).split("=");
    return [key, value ?? true];
  }),
);
const [path = "/", out = "screenshot.png", width = "1440"] = args.filter((arg) => !arg.startsWith("--"));
const widths = flags.widths ? String(flags.widths).split(",").map(Number) : [Number(width)];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext();

if (flags.portal) {
  const login = await context.newPage();
  await login.goto("http://127.0.0.1:5174/login");
  await login.fill('input[name="email"]', "admin");
  await login.fill('input[name="password"]', "admin");
  await login.click("button.login-submit");
  await login.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20000 });
  await login.close();
}
// A Convex connection that never answers keeps every page in its loading state.
if (flags.loading && (flags.portal || flags.live)) await context.routeWebSocket(/convex\.(cloud|site)/, () => {});

const url = flags.portal
  ? `http://127.0.0.1:5174${path}`
  : flags.live
    ? `http://127.0.0.1:5173${path}`
    : `http://127.0.0.1:5174/preview${path}`;
const defaults = resolve(root, "apps/web/src/data/websiteDefaults.ts");

for (const w of widths) {
  const page = await context.newPage();
  await page.setViewportSize({ width: w, height: 900 });
  page.on("pageerror", (error) => console.error("page error:", error.message));
  await page.goto(url, { waitUntil: flags.loading ? "domcontentloaded" : "networkidle" });
  if (!flags.portal && !flags.live && !flags.loading)
    await page.evaluate(async (file) => {
      const { defaultWebsiteContent } = await import(`/@fs${file}`);
      window.postMessage({ type: "sofora-website-preview", content: defaultWebsiteContent }, location.origin);
    }, defaults);
  await page.waitForTimeout(1500);
  const full = !flags.viewport && !flags.selector;
  const height = await page.evaluate(() => document.body.scrollHeight);
  if (full && !flags.loading) {
    // Scroll through once so lazy-loaded images load before the full-page capture.
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
  }
  const file = widths.length > 1 ? out.replace(/(\.png)?$/, `-${w}.png`) : out;
  if (flags.selector) await page.locator(String(flags.selector)).first().screenshot({ path: file });
  else await page.screenshot({ path: file, fullPage: full });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`${file} (${w}px wide, ${height}px tall${overflow ? ", WARNING: horizontal overflow" : ""}) ← ${page.url()}`);
  await page.close();
}
await browser.close();

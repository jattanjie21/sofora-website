// `pnpm screenshot <path> [out.png] [width]` — full-page screenshot of a public-site page.
// Renders through the portal's /preview route with the default content in apps/web/src/data,
// so it works even where the browser can't reach Convex (automated/headless sessions often can't).
// Needs `npm start` running and Google Chrome installed (or CHROME_PATH set).
import { chromium } from "playwright-core";
import { resolve } from "node:path";
import { root } from "./processes.mjs";

const [path = "/", out = "screenshot.png", width = "1440"] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
page.on("pageerror", (error) => console.error("page error:", error.message));
await page.goto(`http://127.0.0.1:5174/preview${path}`, { waitUntil: "networkidle" });
const defaults = resolve(root, "apps/web/src/data/websiteDefaults.ts");
await page.evaluate(async (file) => {
  const { defaultWebsiteContent } = await import(`/@fs${file}`);
  window.postMessage({ type: "sofora-website-preview", content: defaultWebsiteContent }, location.origin);
}, defaults);
await page.waitForTimeout(1500);
// Scroll through once so lazy-loaded images load before the full-page capture.
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 600) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(80);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: out, fullPage: true });
console.log(`${out} (${width}px wide, ${height}px tall)`);
await browser.close();

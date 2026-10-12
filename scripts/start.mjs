// `npm start`: runs Convex, the public website and the staff portal in the background.
// Logs go to .dev/logs and process IDs to .dev/pids.json so `npm stop` can end them.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { createConnection } from "node:net";
import { join } from "node:path";
import { isRunning, logDir, pidFile, root } from "./processes.mjs";

const services = [
  { name: "convex", args: ["exec", "convex", "dev"] },
  { name: "web", args: ["--filter", "@sofora/web", "dev", "--strictPort"], port: 5173 },
  { name: "portal", args: ["--filter", "@sofora/portal", "dev"], port: 5174 },
];

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function portInUse(port) {
  return new Promise(resolve => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("error", () => resolve(false));
  });
}

if (existsSync(pidFile)) {
  const running = JSON.parse(readFileSync(pidFile, "utf8")).filter(service => isRunning(service.pid));
  if (running.length) fail(`Already running (${running.map(s => s.name).join(", ")}). Run \`npm stop\` first.`);
}

const [major] = process.versions.node.split(".").map(Number);
if (major !== 24) fail(`Node 24 is required; this is Node ${process.versions.node}.`);
if (spawnSync("pnpm", ["--version"], { stdio: "ignore" }).status !== 0)
  fail("pnpm is not available. Run `corepack enable` or install pnpm 11.22.0.");
if (!existsSync(join(root, ".env.local")))
  fail("No Convex deployment is configured. Run `pnpm backend:dev` once to log in and pick a deployment.");
for (const app of ["web", "portal"])
  if (!existsSync(join(root, "apps", app, ".env.local")))
    fail(`apps/${app}/.env.local is missing. Copy apps/${app}/.env.example and set VITE_CONVEX_URL.`);
for (const { name, port } of services)
  if (port && await portInUse(port)) fail(`Port ${port} (${name}) is already in use.`);

if (!existsSync(join(root, "node_modules"))) {
  console.log("Installing dependencies…");
  if (spawnSync("pnpm", ["install", "--frozen-lockfile"], { cwd: root, stdio: "inherit" }).status !== 0)
    fail("pnpm install failed.");
}

mkdirSync(logDir, { recursive: true });
const started = services.map(({ name, args }) => {
  const log = openSync(join(logDir, `${name}.log`), "w");
  const child = spawn("pnpm", args, { cwd: root, detached: true, stdio: ["ignore", log, log] });
  child.unref();
  return { name, pid: child.pid };
});
writeFileSync(pidFile, JSON.stringify(started, null, 2));

console.log("Starting Convex, website and portal…");
const deadline = Date.now() + 90_000;
for (const { name, port } of services.filter(s => s.port)) {
  while (!(await portInUse(port))) {
    const dead = started.find(s => !isRunning(s.pid));
    if (dead) fail(`${dead.name} exited during startup. See .dev/logs/${dead.name}.log, then run \`npm stop\`.`);
    if (Date.now() > deadline) fail(`${name} did not start within 90 seconds. See .dev/logs/${name}.log.`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Convex can fail after the websites are up (for example, offline or logged out). The sites still use the
// already-deployed backend, so report it rather than stopping everything.
console.log("Websites are up; waiting for Convex to push functions…");
let convexReady = false;
while (Date.now() < deadline + 60_000 && isRunning(started[0].pid)) {
  const convexLog = readFileSync(join(logDir, "convex.log"), "utf8");
  if (convexLog.includes("✖")) break;
  if ((convexReady = convexLog.includes("Convex functions ready"))) break;
  await new Promise(resolve => setTimeout(resolve, 1_000));
}
if (convexReady) {
  // Creates (or resets) the admin/admin login on deployments with DEV_LOGINS=true.
  const seed = spawnSync("pnpm", ["exec", "convex", "run", "devLogins:seed"], { cwd: root, encoding: "utf8" });
  if (seed.status === 0) console.log("Dev login ready: admin / admin");
  else console.warn("⚠ Couldn't set up the admin/admin dev login. Is DEV_LOGINS=true set? (pnpm exec convex env set DEV_LOGINS true)");
} else
  console.warn("⚠ Convex reported a problem; see .dev/logs/convex.log. Backend changes won't be pushed until it's fixed.");

const opener = process.platform === "darwin" ? "open" : "xdg-open";
for (const url of ["http://127.0.0.1:5173", "http://127.0.0.1:5174"])
  spawn(opener, [url], { stdio: "ignore", detached: true }).on("error", () => {}).unref();

console.log(`
✔ Running in the background

  Website  http://127.0.0.1:5173
  Portal   http://127.0.0.1:5174

  Logs     .dev/logs/{convex,web,portal}.log
  Stop     npm stop
`);

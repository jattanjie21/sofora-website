// `npm stop`: ends everything `npm start` launched.
import { existsSync, readFileSync, rmSync } from "node:fs";
import { isRunning, pidFile } from "./processes.mjs";

if (!existsSync(pidFile)) {
  console.log("Nothing is running.");
  process.exit(0);
}

const services = JSON.parse(readFileSync(pidFile, "utf8"));
// Each service was started as its own process group, so a negative PID also ends Vite/Convex children.
const signal = (pid, name) => { try { process.kill(-pid, name); } catch {} };

for (const { pid } of services) signal(pid, "SIGTERM");
const deadline = Date.now() + 5_000;
while (services.some(s => isRunning(s.pid)) && Date.now() < deadline)
  await new Promise(resolve => setTimeout(resolve, 200));
for (const { pid } of services) if (isRunning(pid)) signal(pid, "SIGKILL");

rmSync(pidFile);
console.log(`Stopped ${services.map(s => s.name).join(", ")}.`);

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const logDir = join(root, ".dev", "logs");
export const pidFile = join(root, ".dev", "pids.json");

export function isRunning(pid) {
  try { process.kill(-pid, 0); return true; } catch { return false; }
}

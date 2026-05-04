import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const OMO_CACHE_DIR = join(homedir(), ".cache", "oh-my-opencode");
const CONNECTED_PROVIDERS_CACHE = join(OMO_CACHE_DIR, "connected-providers.json");

export function isOpenCodeAvailable(): boolean {
  try {
    const result = spawnSync("which", ["opencode"], { stdio: "pipe", timeout: 5000 });
    return result.status === 0 && result.stdout.toString().trim().length > 0;
  } catch {
    return false;
  }
}

export function runOpenCodeProvidersList(): string {
  try {
    const result = execFileSync("opencode", ["providers", "list"], {
      stdio: "pipe",
      timeout: 10000,
      encoding: "utf-8",
    }).trim();
    if (result) return result;
  } catch {}

  if (existsSync(CONNECTED_PROVIDERS_CACHE)) {
    try {
      const raw = readFileSync(CONNECTED_PROVIDERS_CACHE, "utf-8");
      const data = JSON.parse(raw) as { connected: string[]; updatedAt?: string };
      const lines = data.connected.map((id) => `  ${id}`);
      return `Connected providers:\n${lines.join("\n")}`;
    } catch {
      return "Failed to read provider cache";
    }
  }

  return "No providers found (run opencode to populate cache)";
}

export function runOpenCodeProvidersLogin(url?: string): void {
  const args = url ? ["providers", "login", url] : ["providers", "login"];
  spawnSync("opencode", args, { stdio: "inherit" });
}

export function runOpenCodeProvidersLogout(provider?: string): void {
  const args = provider
    ? ["providers", "logout", provider]
    : ["providers", "logout"];
  spawnSync("opencode", args, { stdio: "inherit" });
}

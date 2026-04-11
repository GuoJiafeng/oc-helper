import { execFileSync, spawnSync } from "node:child_process";

export function isOpenCodeAvailable(): boolean {
  try {
    execFileSync("opencode", ["--version"], { stdio: "pipe", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export function runOpenCodeProvidersList(): string {
  return execFileSync("opencode", ["providers", "list"], {
    stdio: "pipe",
    timeout: 30000,
    encoding: "utf-8",
  });
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

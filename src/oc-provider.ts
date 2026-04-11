import { execFileSync } from "node:child_process";

export function isOpenCodeAvailable(): boolean {
  try {
    execFileSync("opencode", ["--version"], { stdio: "pipe", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export function runOpenCodeProvidersList(): string {
  try {
    return execFileSync("opencode", ["providers", "list"], {
      stdio: "pipe",
      timeout: 30000,
      encoding: "utf-8",
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error && "stderr" in err
        ? (err as { stderr: string }).stderr || (err as { message: string }).message
        : String(err);
    throw new Error(msg);
  }
}

export function runOpenCodeProvidersLogin(url?: string): string {
  const args = url ? ["providers", "login", url] : ["providers", "login"];
  try {
    return execFileSync("opencode", args, {
      stdio: "pipe",
      timeout: 60000,
      encoding: "utf-8",
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error && "stderr" in err
        ? (err as { stderr: string }).stderr || (err as { message: string }).message
        : String(err);
    throw new Error(msg);
  }
}

export function runOpenCodeProvidersLogout(provider?: string): string {
  const args = provider
    ? ["providers", "logout", provider]
    : ["providers", "logout"];
  try {
    return execFileSync("opencode", args, {
      stdio: "pipe",
      timeout: 30000,
      encoding: "utf-8",
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error && "stderr" in err
        ? (err as { stderr: string }).stderr || (err as { message: string }).message
        : String(err);
    throw new Error(msg);
  }
}

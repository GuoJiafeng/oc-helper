import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { request } from "node:https";

const CACHE_FILE = join(homedir(), ".config", "opencode", ".oc-helper-update-cache.json");
const CACHE_TTL_MS = 86_400_000;

interface CacheData {
  lastCheck: number;
  latestVersion: string;
}

function parseSemver(v: string): [number, number, number] {
  const parts = v.replace(/^v/, "").split(".").map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function isNewer(remote: string, local: string): boolean {
  const r = parseSemver(remote);
  const l = parseSemver(local);
  for (let i = 0; i < 3; i++) {
    if (r[i] > l[i]) return true;
    if (r[i] < l[i]) return false;
  }
  return false;
}

export function getCurrentVersion(): string {
  const pkg = JSON.parse(
    readFileSync(join(import.meta.dirname ?? ".", "..", "package.json"), "utf-8"),
  );
  return (pkg as { version: string }).version;
}

export function checkForUpdate(currentVersion: string): Promise<string | null> {
  const cached = readCache();
  if (cached && Date.now() - cached.lastCheck < CACHE_TTL_MS) {
    return Promise.resolve(
      isNewer(cached.latestVersion, currentVersion) ? cached.latestVersion : null,
    );
  }

  return new Promise((resolve) => {
    const req = request(
      {
        hostname: "registry.npmjs.org",
        path: "/oc-helper-cli/latest",
        method: "GET",
        headers: { "User-Agent": "oc-helper-cli" },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => (body += chunk.toString()));
        res.on("end", () => {
          try {
            const data = JSON.parse(body) as { version: string };
            const latest = data.version;
            writeCache({ lastCheck: Date.now(), latestVersion: latest });
            resolve(isNewer(latest, currentVersion) ? latest : null);
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on("error", () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

function readCache(): CacheData | null {
  try {
    if (!existsSync(CACHE_FILE)) return null;
    const raw = readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CacheData;
  } catch {
    return null;
  }
}

function writeCache(data: CacheData): void {
  try {
    const dir = join(homedir(), ".config", "opencode");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(data), "utf-8");
  } catch {
  }
}

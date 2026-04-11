import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { CollectedModel, OpenCodeConfig, OhMyOpenAgentConfig } from "./types.js";

const CONFIG_DIR = join(homedir(), ".config", "opencode");

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function readOpenCodeConfig(): OpenCodeConfig {
  const filePath = join(CONFIG_DIR, "opencode.json");
  if (!existsSync(filePath)) return { provider: {}, agent: {} };
  try {
    const raw = readFileSync(filePath, "utf-8");
    const config = JSON.parse(raw) as OpenCodeConfig;
    return { provider: {}, agent: {}, ...config };
  } catch (err) {
    throw new Error(`Failed to parse ${filePath}: ${(err as Error).message}`);
  }
}

export function writeOpenCodeConfig(config: OpenCodeConfig): void {
  const filePath = join(CONFIG_DIR, "opencode.json");
  writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function readOhMyConfig(): OhMyOpenAgentConfig {
  const filePath = join(CONFIG_DIR, "oh-my-openagent.json");
  if (!existsSync(filePath)) return { agents: {}, categories: {} };
  try {
    const raw = readFileSync(filePath, "utf-8");
    const config = JSON.parse(raw) as OhMyOpenAgentConfig;
    return { agents: {}, categories: {}, ...config };
  } catch (err) {
    throw new Error(`Failed to parse ${filePath}: ${(err as Error).message}`);
  }
}

export function writeOhMyConfig(config: OhMyOpenAgentConfig): void {
  const filePath = join(CONFIG_DIR, "oh-my-openagent.json");
  writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function getAllModels(): CollectedModel[] {
  const config = readOpenCodeConfig();
  const models: CollectedModel[] = [];
  for (const [provider, providerConfig] of Object.entries(config.provider ?? {})) {
    for (const [modelId, modelConfig] of Object.entries(providerConfig.models ?? {})) {
      models.push({ provider, modelId, modelConfig });
    }
  }
  return models;
}

export function findByDotPath(obj: unknown, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function resolveTarget(
  target: string
): { type: "agent" | "category"; key: string } | null {
  const ohmy = readOhMyConfig();
  if (ohmy.agents && target in ohmy.agents) return { type: "agent", key: target };
  if (ohmy.categories && target in ohmy.categories) return { type: "category", key: target };
  return null;
}

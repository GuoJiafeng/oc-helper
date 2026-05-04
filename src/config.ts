import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { CollectedModel, OpenCodeConfig, OhMyOpenAgentConfig, ModelConfig } from "./types.js";

const CONFIG_DIR = join(homedir(), ".config", "opencode");
const OMO_CACHE_DIR = join(homedir(), ".cache", "oh-my-opencode");
const PROVIDER_MODELS_CACHE = join(OMO_CACHE_DIR, "provider-models.json");
const CONNECTED_PROVIDERS_CACHE = join(OMO_CACHE_DIR, "connected-providers.json");

interface CachedModelEntry {
  id: string;
  name?: string;
  limit?: { context?: number; output?: number; input?: number };
  capabilities?: { reasoning?: boolean };
}

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
  const seen = new Set<string>();
  const models: CollectedModel[] = [];

  for (const [provider, providerConfig] of Object.entries(config.provider ?? {})) {
    for (const [modelId, modelConfig] of Object.entries(providerConfig.models ?? {})) {
      const key = `${provider}/${modelId}`;
      seen.add(key);
      models.push({ provider, modelId, modelConfig });
    }
  }

  try {
    const connected = readConnectedProviders();
    if (connected.size > 0 && existsSync(PROVIDER_MODELS_CACHE)) {
      const raw = readFileSync(PROVIDER_MODELS_CACHE, "utf-8");
      const data = JSON.parse(raw) as {
        models: Record<string, CachedModelEntry[]>;
        connected?: string[];
        updatedAt?: string;
      };

      for (const [provider, entries] of Object.entries(data.models ?? {})) {
        if (!connected.has(provider)) continue;
        for (const entry of entries) {
          const key = `${provider}/${entry.id}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const modelConfig: ModelConfig = {};
          if (entry.name) modelConfig.name = entry.name;
          if (entry.limit) {
            modelConfig.limit = {};
            if (entry.limit.context) modelConfig.limit.context = entry.limit.context;
            if (entry.limit.output) modelConfig.limit.output = entry.limit.output;
          }
          if (entry.capabilities?.reasoning) {
            modelConfig.options = { thinking: { type: "enabled" } };
          }

          models.push({ provider, modelId: entry.id, modelConfig });
        }
      }
    }
  } catch {}

  return models;
}

export function readConnectedProviders(): Set<string> {
  try {
    if (existsSync(CONNECTED_PROVIDERS_CACHE)) {
      const raw = readFileSync(CONNECTED_PROVIDERS_CACHE, "utf-8");
      const data = JSON.parse(raw) as { connected: string[] };
      return new Set(data.connected ?? []);
    }
  } catch {}
  return new Set();
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

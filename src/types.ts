export interface OpenCodeConfig {
  $schema?: string;
  plugin?: string[];
  provider?: Record<string, ProviderConfig>;
  model?: string;
  small_model?: string;
  default_agent?: string;
  disabled_providers?: string[];
  enabled_providers?: string[];
  agent?: Record<string, AgentConfig>;
  mcp?: Record<string, unknown>;
  tools?: Record<string, boolean>;
  share?: "manual" | "auto" | "disabled";
  autoupdate?: boolean | "notify";
  snapshot?: boolean;
}

export interface ProviderConfig {
  npm?: string;
  name?: string;
  api?: string;
  options?: {
    baseURL?: string;
    apiKey?: string;
    timeout?: number;
  };
  models?: Record<string, ModelConfig>;
}

export interface ModelConfig {
  name?: string;
  id?: string;
  family?: string;
  modalities?: {
    input: string[];
    output: string[];
  };
  limit?: {
    context?: number;
    output?: number;
    input?: number;
  };
  options?: {
    thinking?: {
      type: string;
      budgetTokens?: number;
    };
  };
  cost?: {
    input: number;
    output: number;
  };
}

export interface AgentConfig {
  model?: string;
  prompt?: string;
  description?: string;
  disable?: boolean;
  hidden?: boolean;
  mode?: "subagent" | "primary" | "all";
  tools?: Record<string, boolean>;
}

export interface OhMyOpenAgentConfig {
  $schema?: string;
  agents?: Record<string, OhMyAgentEntry>;
  categories?: Record<string, OhMyCategoryEntry>;
  _migrations?: string[];
}

export interface OhMyAgentEntry {
  model: string;
  variant?: string;
}

export interface OhMyCategoryEntry {
  model: string;
  variant?: string;
}

export interface CollectedModel {
  provider: string;
  modelId: string;
  modelConfig: ModelConfig;
}

export type ModelUsageSource = "opencode.agent" | "oh-my.agents" | "oh-my.categories";

export interface ModelUsage {
  source: ModelUsageSource;
  target: string;
  model: string;
  variant?: string;
}

export type SwitchTargetType = "agent" | "category";

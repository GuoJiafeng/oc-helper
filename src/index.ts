#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import {
  getAllModels,
  readOhMyConfig,
  readOpenCodeConfig,
  writeOhMyConfig,
  writeOpenCodeConfig,
  findByDotPath,
} from "./config.js";
import {
  formatContextSize,
  formatError,
  formatJSON,
  formatTable,
  formatValue,
  formatWarning,
} from "./display.js";
import { t } from "./i18n.js";
import { interactiveModelSwitch } from "./switch.js";
import { runInteractive } from "./interactive.js";
import { createBackup, listBackups, restoreBackup, deleteBackup } from "./backup.js";
import { isOpenCodeAvailable, runOpenCodeProvidersList, runOpenCodeProvidersLogin, runOpenCodeProvidersLogout } from "./oc-provider.js";
import { getCurrentVersion, checkForUpdate } from "./update-check.js";
import type {
  CollectedModel,
  OhMyAgentEntry,
  OhMyCategoryEntry,
  ModelConfig,
  ProviderConfig,
} from "./types.js";

function parseProviderModel(input: string): { provider: string; modelId: string } {
  const idx = input.indexOf("/");
  if (idx <= 0 || idx === input.length - 1) {
    throw new Error(t("modelSetInvalid", { ref: input }));
  }
  return { provider: input.slice(0, idx), modelId: input.slice(idx + 1) };
}

function getDotPathValue(source: unknown, pathExpression: string): unknown {
  return pathExpression.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(segment);
      return Number.isInteger(index) ? current[index] : undefined;
    }
    if (typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

const KNOWN_AGENTS = [
  "hephaestus", "oracle", "librarian", "explore", "multimodal-looker",
  "prometheus", "metis", "momus", "atlas", "sisyphus-junior", "build",
  "plan", "general",
];

function guessTargetType(target: string): "agent" | "category" {
  return KNOWN_AGENTS.includes(target) ? "agent" : "category";
}

function printSuccess(msg: string): void {
  console.log(`${chalk.green("✓")} ${msg}`);
}

function printSection(title: string, content: string): void {
  console.log(chalk.bold(title));
  console.log(content);
}

function handleList(type?: string): void {
  const validTypes = ["providers", "models", "agents", "categories"];
  if (type && !validTypes.includes(type)) {
    throw new Error(`${type}. ${[t("providers"), t("models"), t("agents"), t("categories")].join(", ")}`);
  }

  if (!type) {
    const oc = readOpenCodeConfig();
    const ohmy = readOhMyConfig();
    const models = getAllModels();
    console.log(chalk.bold(t("summary")));
    console.log(`  ${t("summaryProviders")}  ${Object.keys(oc.provider ?? {}).length}`);
    console.log(`  ${t("summaryModels")}     ${models.length}`);
    console.log(`  ${t("summaryAgents")}     ${Object.keys(ohmy.agents ?? {}).length}`);
    console.log(`  ${t("summaryCategories")} ${Object.keys(ohmy.categories ?? {}).length}`);
    console.log();
  }

  if (!type || type === "providers") listProviders();
  if (!type || type === "models") listModels();
  if (!type || type === "agents") listAgents();
  if (!type || type === "categories") listCategories();
}

function listProviders(): void {
  const config = readOpenCodeConfig();
  const rows = Object.entries(config.provider ?? {}).map(([name, p]: [string, ProviderConfig]) => [
    chalk.cyan(p.name ?? name),
    String(Object.keys(p.models ?? {}).length),
    p.options?.baseURL ?? p.api ?? "-",
  ]);
  printSection(t("providers"), rows.length > 0
    ? formatTable([t("colName"), t("colModelCount"), t("colBaseURL")], rows)
    : formatWarning(t("noProviders")));
  console.log();
}

function listModels(): void {
  const models = getAllModels();
  const rows = models.map((m: CollectedModel) => [
    chalk.cyan(m.provider),
    m.modelId,
    m.modelConfig.name ?? "-",
    formatContextSize(m.modelConfig.limit?.context),
    formatContextSize(m.modelConfig.limit?.output),
    m.modelConfig.options?.thinking?.type ?? "-",
  ]);
  printSection(t("models"), rows.length > 0
    ? formatTable([t("colProvider"), t("colModelID"), t("colDisplayName"), t("colContext"), t("colOutput"), t("colThinking")], rows)
    : formatWarning(t("noModels")));
  console.log();
}

function listAgents(): void {
  const oc = readOpenCodeConfig();
  const ohmy = readOhMyConfig();
  const merged = new Map<string, { model: string; variant?: string; source: string }>();

  for (const [name, cfg] of Object.entries(oc.agent ?? {})) {
    if (cfg.model) merged.set(name, { model: cfg.model, source: t("configShowOCFile") });
  }
  for (const [name, entry] of Object.entries(ohmy.agents ?? {})) {
    merged.set(name, { model: entry.model, variant: entry.variant, source: t("configShowOhmyFile") });
  }

  const rows = Array.from(merged.entries()).map(([name, info]) => [
    chalk.yellow(name),
    chalk.cyan(info.model),
    info.variant ?? "-",
    chalk.gray(info.source),
  ]);
  printSection(t("agents"), rows.length > 0
    ? formatTable([t("colAgent"), t("colModel"), t("colVariant"), t("source")], rows)
    : formatWarning(t("noAgents")));
  console.log();
}

function listCategories(): void {
  const ohmy = readOhMyConfig();
  const rows = Object.entries(ohmy.categories ?? {}).map(([name, entry]: [string, OhMyCategoryEntry]) => [
    chalk.yellow(name),
    chalk.cyan(entry.model),
    entry.variant ?? "-",
  ]);
  printSection(t("categories"), rows.length > 0
    ? formatTable([t("colCategory"), t("colModel"), t("colVariant")], rows)
    : formatWarning(t("noCategories")));
  console.log();
}

function handleModelGet(target: string): void {
  const ohmy = readOhMyConfig();

  if (ohmy.agents && target in ohmy.agents) {
    const a = ohmy.agents[target];
    const v = a.variant ? chalk.gray(` (${t("colVariant")}: ${a.variant})`) : "";
    console.log(`${t("modelGetAgent", { name: chalk.bold(target), model: chalk.cyan(a.model) })}${v}`);
    return;
  }

  if (ohmy.categories && target in ohmy.categories) {
    const c = ohmy.categories[target];
    const v = c.variant ? chalk.gray(` (${t("colVariant")}: ${c.variant})`) : "";
    console.log(`${t("modelGetCategory", { name: chalk.bold(target), model: chalk.cyan(c.model) })}${v}`);
    return;
  }

  const oc = readOpenCodeConfig();
  if (oc.agent && target in oc.agent) {
    const a = oc.agent[target];
    if (a.model) {
      console.log(`${t("modelGetAgentOC", { name: chalk.bold(target), model: chalk.cyan(a.model) })} ${chalk.gray(`(${t("configShowOCFile")})`)}`);
      return;
    }
  }

  const suggestions = [
    ...Object.keys(ohmy.agents ?? {}),
    ...Object.keys(ohmy.categories ?? {}),
    ...Object.keys(oc.agent ?? {}),
  ];
  const hint = suggestions.length > 0 ? ` ${t("modelSetKnownAgents", { list: suggestions.join(", ") })}` : "";
  throw new Error(`${t("modelNotFound", { name: target })}${hint}`);
}

function handleModelSet(target: string, modelReference: string, variant?: string, force = false): void {
  const { provider, modelId } = parseProviderModel(modelReference);
  const ocConfig = readOpenCodeConfig();
  const providerConfig = ocConfig.provider?.[provider];

  if (!providerConfig) {
    throw new Error(
      t("modelSetProviderNotFound", { name: provider, list: Object.keys(ocConfig.provider ?? {}).join(", ") })
    );
  }

  if (!providerConfig.models?.[modelId]) {
    console.log(formatWarning(t("modelSetModelNotFound", { id: modelId, provider })));
  }

  const ohmy = readOhMyConfig();
  const isAgent = target in (ohmy.agents ?? {});
  const isCategory = target in (ohmy.categories ?? {});

  if (!isAgent && !isCategory && !force) {
    const guessed = guessTargetType(target);
    throw new Error(
      `${t("modelSetForceRequired", { name: target, type: t(guessed) })}\n` +
      `  ${t("modelSetKnownAgents", { list: Object.keys(ohmy.agents ?? {}).join(", ") })}\n` +
      `  ${t("modelSetKnownCategories", { list: Object.keys(ohmy.categories ?? {}).join(", ") })}`
    );
  }

  const resolvedType = isAgent ? "agent" : isCategory ? "category" : guessTargetType(target);
  const entry = { model: `${provider}/${modelId}`, ...(variant ? { variant } : {}) };

  if (resolvedType === "agent") {
    ohmy.agents = { ...(ohmy.agents ?? {}), [target]: entry as OhMyAgentEntry };
  } else {
    ohmy.categories = { ...(ohmy.categories ?? {}), [target]: entry as OhMyCategoryEntry };
  }

  writeOhMyConfig(ohmy);
  const model = `${chalk.cyan(`${provider}/${modelId}`)}${variant ? chalk.gray(` (${t("colVariant")}: ${variant})`) : ""}`;
  printSuccess(t("setSuccess", { type: t(resolvedType), name: chalk.bold(target), model }));
}

function handleModelRemove(target: string): void {
  const ohmy = readOhMyConfig();
  const inAgents = target in (ohmy.agents ?? {});
  const inCategories = target in (ohmy.categories ?? {});

  if (!inAgents && !inCategories) {
    throw new Error(t("modelRemoveNotFound", { name: target }));
  }

  if (inAgents) {
    delete ohmy.agents![target];
    printSuccess(t("modelRemovedAgent", { name: chalk.bold(target) }));
  }
  if (inCategories) {
    delete ohmy.categories![target];
    printSuccess(t("modelRemovedCategory", { name: chalk.bold(target) }));
  }

  writeOhMyConfig(ohmy);
}

async function handleSwitch(type: string, target: string): Promise<void> {
  if (type !== "agent" && type !== "category") {
    throw new Error(t("switchInvalidType", { type }));
  }
  const selected = await interactiveModelSwitch(type, target);
  printSuccess(t("setSuccess", { type: t(type), name: chalk.bold(target), model: chalk.cyan(selected) }));
}

function handleProviderShow(name: string): void {
  const config = readOpenCodeConfig();
  const p = config.provider?.[name];
  if (!p) {
    throw new Error(
      t("providerNotFound", { name, list: Object.keys(config.provider ?? {}).join(", ") })
    );
  }

  console.log(chalk.bold(`\n${t("providers")}: ${chalk.cyan(p.name ?? name)}`));
  if (p.name) console.log(`  ${t("providerKey")}          ${name}`);
  if (p.npm) console.log(`  ${t("providerDetailNPM")}  ${p.npm}`);
  if (p.options?.baseURL) console.log(`  ${t("providerDetailURL")}     ${p.options.baseURL}`);
  if (p.options?.apiKey) {
    const key = p.options.apiKey;
    const masked = key.length > 12 ? key.slice(0, 8) + "..." + key.slice(-4) : "***";
    console.log(`  ${t("providerDetailKey")}      ${masked}`);
  }
  console.log();

  const modelKeys = Object.keys(p.models ?? {});
  if (modelKeys.length > 0) {
    console.log(chalk.bold(`  ${t("models")} (${modelKeys.length}):`));
    const rows = modelKeys.map((id) => {
      const m = p.models![id];
      return [id, m.name ?? "-", formatContextSize(m.limit?.context), formatContextSize(m.limit?.output), m.options?.thinking?.type ?? "-"];
    });
    console.log(formatTable([t("colModelID"), t("colDisplayName"), t("colContext"), t("colOutput"), t("colThinking")], rows));
  } else {
    console.log(formatWarning(`  ${t("providerNoModelsDetail")}`));
  }
  console.log();
}

function handleProviderAdd(
  name: string,
  options: { npm?: string; "base-url"?: string; "api-key"?: string }
): void {
  const config = readOpenCodeConfig();
  if (config.provider?.[name]) {
    throw new Error(t("providerExists", { name }));
  }
  if (!config.provider) config.provider = {};
  config.provider[name] = {
    ...(options.npm ? { npm: options.npm } : {}),
    options: {
      ...(options["base-url"] ? { baseURL: options["base-url"] } : {}),
      ...(options["api-key"] ? { apiKey: options["api-key"] } : {}),
    },
    models: {},
  };
  writeOpenCodeConfig(config);
  printSuccess(t("providerAdded", { name: chalk.bold(name) }));
}

function handleProviderRemove(name: string): void {
  const config = readOpenCodeConfig();
  if (!config.provider?.[name]) {
    throw new Error(t("providerNotFound", { name, list: Object.keys(config.provider ?? {}).join(", ") }));
  }
  delete config.provider![name];
  writeOpenCodeConfig(config);
  printSuccess(t("providerRemoved", { name: chalk.bold(name) }));
}

function handleModelAdd(
  providerName: string,
  modelId: string,
  options: { name?: string; context?: string; output?: string; thinking?: string }
): void {
  const config = readOpenCodeConfig();
  const provider = config.provider?.[providerName];
  if (!provider) {
    throw new Error(t("providerNotFound", { name: providerName, list: Object.keys(config.provider ?? {}).join(", ") }));
  }
  if (provider.models?.[modelId]) {
    throw new Error(t("modelExists", { id: modelId }));
  }
  if (!provider.models) provider.models = {};

  const modelCfg: ModelConfig = {
    ...(options.name ? { name: options.name } : { name: modelId }),
    ...(options.context || options.output ? {
      limit: {
        ...(options.context ? { context: parseInt(options.context, 10) } : {}),
        ...(options.output ? { output: parseInt(options.output, 10) } : {}),
      },
    } : {}),
    ...(options.thinking ? {
      options: { thinking: { type: options.thinking } },
    } : {}),
  };

  provider.models[modelId] = modelCfg;
  writeOpenCodeConfig(config);
  printSuccess(t("modelAdded", { id: chalk.bold(modelId), provider: chalk.cyan(providerName) }));
}

function handleModelDefRemove(providerName: string, modelId: string): void {
  const config = readOpenCodeConfig();
  const provider = config.provider?.[providerName];
  if (!provider) {
    throw new Error(t("providerNotFound", { name: providerName, list: Object.keys(config.provider ?? {}).join(", ") }));
  }
  if (!provider.models?.[modelId]) {
    throw new Error(t("modelRemoveNotFound", { name: modelId }));
  }
  delete provider.models![modelId];
  writeOpenCodeConfig(config);
  printSuccess(t("modelRemoved", { id: chalk.bold(modelId) }));
}

function handleConfigShow(): void {
  console.log(chalk.bold(`\n${t("configShowOCFile")}`));
  console.log(formatJSON(readOpenCodeConfig()));
  console.log();
  console.log(chalk.bold(t("configShowOhmyFile")));
  console.log(formatJSON(readOhMyConfig()));
  console.log();
}

function handleConfigGet(pathExpression: string): void {
  const ocConfig = readOpenCodeConfig();
  let value = getDotPathValue(ocConfig, pathExpression);
  let source = t("configShowOCFile");

  if (value === undefined) {
    const ohmy = readOhMyConfig();
    value = getDotPathValue(ohmy, pathExpression);
    source = t("configShowOhmyFile");
  }

  if (value === undefined) {
    throw new Error(t("configNotFound", { path: pathExpression }));
  }

  console.log(chalk.gray(`[${source}]`));
  console.log(formatValue(value));
}

function main(): void {
  const hasNoArgs = process.argv.length <= 2;
  const isInteractive = hasNoArgs && process.stdin.isTTY;

  if (isInteractive) {
    runInteractive().catch((err) => {
      if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "ExitPromptError") {
        console.log(chalk.gray(`\n${t("bye")}`));
        return;
      }
      console.error(formatError((err as Error).message));
      process.exitCode = 1;
    });
    return;
  }

  const program = new Command();

  program
    .name("oc-helper-cli")
    .description("OC Helper - Manage OpenCode configuration")
    .version("1.0.0")
    .showHelpAfterError();

  program
    .command("list")
    .description("List providers, models, agents, or categories")
    .argument("[type]", "providers | models | agents | categories")
    .action((type?: string) => handleList(type));

  const modelCommand = program.command("model").description("Get or set model assignments");

  modelCommand
    .command("get")
    .description("Show current model for an agent or category")
    .argument("<target>", "Agent or category name")
    .action((target: string) => handleModelGet(target));

  modelCommand
    .command("set")
    .description("Set model for an agent or category")
    .argument("<target>", "Agent or category name")
    .argument("<provider/model>", "Model in provider/model format")
    .argument("[variant]", "Optional variant")
    .option("--force", "Create target if it doesn't exist")
    .action((target: string, providerModel: string, variant?: string, opts?: { force?: boolean }) =>
      handleModelSet(target, providerModel, variant, opts?.force ?? false)
    );

  modelCommand
    .command("remove")
    .description("Remove an agent or category assignment")
    .argument("<target>", "Agent or category name")
    .action((target: string) => handleModelRemove(target));

  program
    .command("switch")
    .description("Interactively select a model for an agent or category")
    .argument("<type>", "agent | category")
    .argument("<target>", "Agent or category name")
    .action((type: string, target: string) => handleSwitch(type, target));

  const providerCommand = program.command("provider").description("Manage providers");

  providerCommand
    .command("show")
    .description("Show provider details with all models")
    .argument("<name>", "Provider name")
    .action((name: string) => handleProviderShow(name));

  providerCommand
    .command("add")
    .description("Add a new provider")
    .argument("<name>", "Provider name")
    .option("--npm <package>", "NPM package for the provider SDK")
    .option("--base-url <url>", "API base URL")
    .option("--api-key <key>", "API key")
    .action((name: string, opts: { npm?: string; "base-url"?: string; "api-key"?: string }) =>
      handleProviderAdd(name, opts)
    );

  providerCommand
    .command("remove")
    .description("Remove a provider")
    .argument("<name>", "Provider name")
    .action((name: string) => handleProviderRemove(name));

  const modelDefCommand = program.command("model-def").description("Manage model definitions in opencode.json");

  modelDefCommand
    .command("add")
    .description("Add a model definition to a provider")
    .argument("<provider>", "Provider name")
    .argument("<model-id>", "Model ID")
    .option("--name <name>", "Display name")
    .option("--context <tokens>", "Context window size in tokens")
    .option("--output <tokens>", "Max output tokens")
    .option("--thinking <type>", "Thinking type (e.g. enabled)")
    .action((provider: string, modelId: string, opts: { name?: string; context?: string; output?: string; thinking?: string }) =>
      handleModelAdd(provider, modelId, opts)
    );

  modelDefCommand
    .command("remove")
    .description("Remove a model definition from a provider")
    .argument("<provider>", "Provider name")
    .argument("<model-id>", "Model ID")
    .action((provider: string, modelId: string) => handleModelDefRemove(provider, modelId));

  const configCommand = program.command("config").description("View raw configuration");

  configCommand.command("show").description("Display both config files").action(handleConfigShow);

  configCommand
    .command("get")
    .description("Get a config value by dot-notation path")
    .argument("<path>", "Dot-notation path (e.g. provider.minimax.options.baseURL)")
    .action((pathExpression: string) => handleConfigGet(pathExpression));

  const backupCommand = program.command("backup").description("Manage config backups");

  backupCommand
    .command("create")
    .description("Create a backup of current config files")
    .argument("[label]", "Optional label for the backup")
    .action((label?: string) => {
      const id = createBackup(label);
      printSuccess(t("backupCreated", { id: chalk.bold(id) }));
    });

  backupCommand
    .command("list")
    .description("List all backups")
    .action(() => {
      const backups = listBackups();
      if (backups.length === 0) {
        console.log(formatWarning(t("backupNone")));
        return;
      }
      const rows = backups.map((b) => [
        chalk.cyan(b.display),
        `${((b.opencodeSize + b.ohmySize) / 1024).toFixed(1)} KB`,
      ]);
      printSection(t("backupMenuTitle"), formatTable([t("backupColID"), t("backupColSize")], rows));
      console.log();
    });

  backupCommand
    .command("restore")
    .description("Restore config from a backup")
    .argument("<id>", "Backup ID (use 'backup list' to see IDs)")
    .action((id: string) => {
      restoreBackup(id);
      printSuccess(t("backupRestored", { id: chalk.bold(id) }));
    });

  backupCommand
    .command("delete")
    .description("Delete a backup")
    .argument("<id>", "Backup ID to delete")
    .action((id: string) => {
      deleteBackup(id);
      printSuccess(t("backupDeleted", { id: chalk.bold(id) }));
    });

  const ocProviderCommand = program.command("oc-provider").description("Manage OpenCode built-in providers via opencode CLI");

  ocProviderCommand
    .command("list")
    .description("List built-in providers and credentials")
    .action(() => {
      if (!isOpenCodeAvailable()) {
        throw new Error(t("ocProviderNotFound"));
      }
      try {
        const output = runOpenCodeProvidersList();
        console.log(output);
      } catch (err) {
        throw new Error(t("ocProviderFailed", { error: (err as Error).message }));
      }
    });

  ocProviderCommand
    .command("login")
    .description("Login to a provider (configure API key)")
    .argument("[url]", "Provider URL (e.g. https://api.openai.com)")
    .action((url?: string) => {
      if (!isOpenCodeAvailable()) {
        throw new Error(t("ocProviderNotFound"));
      }
      try {
        const output = runOpenCodeProvidersLogin(url);
        if (output) console.log(output);
        printSuccess(t("ocProviderSuccess"));
      } catch (err) {
        throw new Error(t("ocProviderFailed", { error: (err as Error).message }));
      }
    });

  ocProviderCommand
    .command("logout")
    .description("Logout from a provider (remove credentials)")
    .argument("[provider]", "Provider name to logout")
    .action((provider?: string) => {
      if (!isOpenCodeAvailable()) {
        throw new Error(t("ocProviderNotFound"));
      }
      try {
        const output = runOpenCodeProvidersLogout(provider);
        if (output) console.log(output);
        printSuccess(t("ocProviderSuccess"));
      } catch (err) {
        throw new Error(t("ocProviderFailed", { error: (err as Error).message }));
      }
    });

  program
    .command("interactive")
    .description("Launch interactive mode")
    .action(() => {
      runInteractive().catch((err) => {
        if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "ExitPromptError") {
          console.log(chalk.gray(`\n${t("bye")}`));
          return;
        }
        console.error(formatError((err as Error).message));
        process.exitCode = 1;
      });
    });

  program.parse();
}

main();

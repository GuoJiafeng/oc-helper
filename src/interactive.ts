import { select, input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import {
  getAllModels,
  readOhMyConfig,
  readOpenCodeConfig,
  writeOhMyConfig,
  writeOpenCodeConfig,
  readConnectedProviders,
} from "./config.js";
import {
  formatContextSize,
  formatError,
  formatJSON,
  formatTable,
  formatWarning,
} from "./display.js";
import { t, setLang, getLang, type Lang } from "./i18n.js";
import { createBackup, listBackups, restoreBackup, deleteBackup } from "./backup.js";
import { isOpenCodeAvailable, runOpenCodeProvidersList, runOpenCodeProvidersLogin, runOpenCodeProvidersLogout } from "./oc-provider.js";
import { getCurrentVersion, checkForUpdate } from "./update-check.js";
import type {
  CollectedModel,
  OhMyAgentEntry,
  OhMyCategoryEntry,
  ModelConfig,
} from "./types.js";

function isUserCancel(err: unknown): boolean {
  return err instanceof Error && "name" in err && (err as { name: string }).name === "ExitPromptError";
}

async function safeRun(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    if (isUserCancel(err)) return;
    throw err;
  }
}

type MenuAction = "list" | "model-set" | "model-remove" | "model-view" | "provider" | "oc-provider" | "config" | "backup" | "lang" | "back" | "quit";

async function pause(): Promise<void> {
  await input({ message: chalk.gray(t("pressEnter")), default: "" });
}

async function mainMenu(version: string): Promise<MenuAction> {
  return select<MenuAction>({
    message: chalk.bold(`  ${chalk.cyan("OC Helper")} ${chalk.gray(`v${version}`)}\n\n${t("mainMenuTitle")}`),
    choices: [
      { name: t("mainMenuList"), value: "list", description: t("mainMenuListDesc") },
      { name: t("mainMenuModelSet"), value: "model-set", description: t("mainMenuModelSetDesc") },
      { name: t("mainMenuModelRemove"), value: "model-remove", description: t("mainMenuModelRemoveDesc") },
      { name: t("mainMenuModelView"), value: "model-view", description: t("mainMenuModelViewDesc") },
      { name: t("mainMenuProvider"), value: "provider", description: t("mainMenuProviderDesc") },
      { name: t("ocProviderTitle"), value: "oc-provider", description: t("ocProviderMenuDesc") },
      { name: t("mainMenuConfig"), value: "config", description: t("mainMenuConfigDesc") },
      { name: t("backupCreate"), value: "backup", description: t("backupCreateDesc") },
      { name: t("langSwitch"), value: "lang", description: t("langSwitchDesc") },
      { name: t("mainMenuQuit"), value: "quit" },
    ],
    pageSize: 20,
  });
}

async function interactiveList(): Promise<void> {
  const section = await select<string>({
    message: t("listTitle"),
    choices: [
      { name: t("listAll"), value: "all" },
      { name: t("listProviders"), value: "providers" },
      { name: t("listModels"), value: "models" },
      { name: t("listAgents"), value: "agents" },
      { name: t("listCategories"), value: "categories" },
      { name: t("providerBack"), value: "back" },
    ],
  pageSize: 20,
  });

  if (section === "back") return;

  console.log();

  if (section === "all" || section === "providers") {
    const config = readOpenCodeConfig();
    const entries = Object.entries(config.provider ?? {});
    if (entries.length === 0) {
      console.log(formatWarning(t("noProviders")));
    } else {
      const rows = entries.map(([name, p]) => [
        chalk.cyan(p.name ?? name),
        String(Object.keys(p.models ?? {}).length),
        p.options?.baseURL ?? "-",
      ]);
      console.log(chalk.bold(t("providers")));
      console.log(formatTable([t("colName"), t("colModelCount"), t("colBaseURL")], rows));
    }
    console.log();
  }

  if (section === "all" || section === "models") {
    const models = getAllModels();
    if (models.length === 0) {
      console.log(formatWarning(t("noModels")));
    } else {
      const rows = models.map((m: CollectedModel) => [
        chalk.cyan(m.provider),
        m.modelId,
        m.modelConfig.name ?? "-",
        formatContextSize(m.modelConfig.limit?.context),
        formatContextSize(m.modelConfig.limit?.output),
        m.modelConfig.options?.thinking?.type ?? "-",
      ]);
      console.log(chalk.bold(t("models")));
      console.log(formatTable([t("colProvider"), t("colModelID"), t("colName"), t("colContext"), t("colOutput"), t("colThinking")], rows));
    }
    console.log();
  }

  if (section === "all" || section === "agents") {
    const oc = readOpenCodeConfig();
    const ohmy = readOhMyConfig();
    const merged = new Map<string, { model: string; variant?: string; source: string }>();
    for (const [name, cfg] of Object.entries(oc.agent ?? {})) {
      if (cfg.model) merged.set(name, { model: cfg.model, source: t("configShowOCFile") });
    }
    for (const [name, entry] of Object.entries(ohmy.agents ?? {})) {
      merged.set(name, { model: entry.model, variant: entry.variant, source: t("configShowOhmyFile") });
    }
    if (merged.size === 0) {
      console.log(formatWarning(t("noAgents")));
    } else {
      const rows = Array.from(merged.entries()).map(([name, info]) => [
        chalk.yellow(name), chalk.cyan(info.model), info.variant ?? "-", chalk.gray(info.source),
      ]);
      console.log(chalk.bold(t("agents")));
      console.log(formatTable([t("colAgent"), t("colModel"), t("colVariant"), t("source")], rows));
    }
    console.log();
  }

  if (section === "all" || section === "categories") {
    const ohmy = readOhMyConfig();
    const entries = Object.entries(ohmy.categories ?? {});
    if (entries.length === 0) {
      console.log(formatWarning(t("noCategories")));
    } else {
      const rows = entries.map(([name, entry]: [string, OhMyCategoryEntry]) => [
        chalk.yellow(name), chalk.cyan(entry.model), entry.variant ?? "-",
      ]);
      console.log(chalk.bold(t("categories")));
      console.log(formatTable([t("colCategory"), t("colModel"), t("colVariant")], rows));
    }
    console.log();
  }

  await pause();
}

async function interactiveModelSet(): Promise<void> {
  const ohmy = readOhMyConfig();
  const allTargets = [
    ...Object.entries(ohmy.agents ?? {}).map(([n, e]) => ({
      name: `${chalk.yellow(n)} ${chalk.gray(`(${t("agent")})`)} ${e.model ? chalk.dim(`→ ${e.model}`) : ""}`,
      value: `agent:${n}`,
    })),
    ...Object.entries(ohmy.categories ?? {}).map(([n, e]) => ({
      name: `${chalk.yellow(n)} ${chalk.gray(`(${t("category")})`)} ${e.model ? chalk.dim(`→ ${e.model}`) : ""}`,
      value: `category:${n}`,
    })),
    { name: t("providerBack"), value: "back" },
  ];

  if (allTargets.length === 1) {
    console.log(formatWarning(t("noTargets")));
    await pause();
    return;
  }

  const targetChoice = await select<string>({
    message: t("selectTarget"),
    choices: allTargets,
  pageSize: 20,
  });

  if (targetChoice === "back") return;

  const [targetType, targetName] = targetChoice.split(":") as [string, string];

  const models = getAllModels();
  if (models.length === 0) {
    console.log(formatWarning(t("noModelsAvail")));
    await pause();
    return;
  }

  const current = targetType === "agent"
    ? ohmy.agents?.[targetName]
    : ohmy.categories?.[targetName];

  const currentModel = current?.model ?? "-";
  console.log(chalk.gray(t("currentModel", { model: currentModel })));

  const modelChoice = await select<string>({
    message: t("selectNewModel", { type: t(targetType as "agent" | "category"), name: targetName }),
    choices: [
      ...models.map((m: CollectedModel) => ({
        name: `${chalk.cyan(m.provider)}/${m.modelId}${m.modelConfig.name ? chalk.gray(` (${m.modelConfig.name})`) : ""}`,
        value: `${m.provider}/${m.modelId}`,
      })),
      { name: t("providerBack"), value: "__back__" },
    ],
    pageSize: 15,
  });

  if (modelChoice === "__back__") return;

  const setVariant = await confirm({ message: t("setVariantQ"), default: false });
  let variant: string | undefined;
  if (setVariant) {
    variant = await input({ message: t("variantName") });
  }

  const entry = { model: modelChoice, ...(variant ? { variant } : {}) };
  if (targetType === "agent") {
    ohmy.agents = { ...(ohmy.agents ?? {}), [targetName]: entry as OhMyAgentEntry };
  } else {
    ohmy.categories = { ...(ohmy.categories ?? {}), [targetName]: entry as OhMyCategoryEntry };
  }
  writeOhMyConfig(ohmy);

  const v = variant ? chalk.gray(` ${t("colVariant")}=${variant}`) : "";
  console.log(`${chalk.green("✓")} ${t("setSuccess", { type: t(targetType as "agent" | "category"), name: targetName, model: modelChoice })}${v}`);
  await pause();
}

async function interactiveModelView(): Promise<void> {
  const ohmy = readOhMyConfig();
  const oc = readOpenCodeConfig();

  const targets = [
    ...Object.entries(ohmy.agents ?? {}).map(([n, e]) => ({ name: n, type: t("agent"), model: e.model, variant: e.variant })),
    ...Object.entries(ohmy.categories ?? {}).map(([n, e]) => ({ name: n, type: t("category"), model: e.model, variant: e.variant })),
    ...Object.entries(oc.agent ?? {}).filter(([, c]) => c.model).map(([n, c]) => ({ name: n, type: `${t("agent")} (${t("configShowOCFile")})`, model: c.model!, variant: undefined })),
  ];

  if (targets.length === 0) {
    console.log(formatWarning(t("noAssignments")));
    await pause();
    return;
  }

  const target = await select<typeof targets[number] | "back">({
    message: t("viewModelFor"),
    choices: [
      ...targets.map((tgt) => ({
        name: `${chalk.yellow(tgt.name)} ${chalk.gray(`[${tgt.type}]`)} → ${chalk.cyan(tgt.model)}${tgt.variant ? chalk.gray(` (${tgt.variant})`) : ""}`,
        value: tgt as typeof targets[number] | "back",
      })),
      { name: t("providerBack"), value: "back" as const },
    ],
  pageSize: 20,
  });

  if (target === "back") return;

  console.log();
  console.log(`  ${chalk.bold(target.name)} (${target.type})`);
  console.log(`  ${t("colModel")}:   ${chalk.cyan(target.model)}`);
  if (target.variant) console.log(`  ${t("colVariant")}: ${chalk.green(target.variant)}`);

  const [provider, modelId] = target.model.includes("/") ? target.model.split("/") : [target.model, ""];
  if (modelId) {
    const providerCfg = oc.provider?.[provider];
    const modelCfg = providerCfg?.models?.[modelId];
    if (modelCfg) {
      console.log(`  ${t("display")} ${modelCfg.name ?? "-"}`);
      console.log(`  ${t("colContext")}: ${formatContextSize(modelCfg.limit?.context)}`);
      console.log(`  ${t("colOutput")}:  ${formatContextSize(modelCfg.limit?.output)}`);
      if (modelCfg.options?.thinking) {
        console.log(`  ${t("colThinking")}: ${modelCfg.options.thinking.type}`);
      }
    }
  }
  console.log();
  await pause();
}

async function interactiveModelRemove(): Promise<void> {
  const ohmy = readOhMyConfig();
  const entries = [
    ...Object.keys(ohmy.agents ?? {}).map((n) => ({ name: n, type: "agent" as const })),
    ...Object.keys(ohmy.categories ?? {}).map((n) => ({ name: n, type: "category" as const })),
  ];

  if (entries.length === 0) {
    console.log(formatWarning(t("noAssignments")));
    await pause();
    return;
  }

  const target = await select<{ name: string; type: "agent" | "category" } | "back">({
    message: t("removeSelectTarget"),
    choices: [
      ...entries.map((e) => ({
        name: `${chalk.yellow(e.name)} ${chalk.gray(`[${t(e.type)}]`)}`,
        value: e as { name: string; type: "agent" | "category" } | "back",
      })),
      { name: t("providerBack"), value: "back" as const },
    ],
  pageSize: 20,
  });

  if (target === "back") return;

  const confirmed = await confirm({
    message: t("removeConfirm", { type: t(target.type), name: target.name }),
    default: false,
  });

  if (!confirmed) {
    console.log(chalk.gray(t("cancelled")));
    await pause();
    return;
  }

  if (target.type === "agent") {
    delete ohmy.agents![target.name];
  } else {
    delete ohmy.categories![target.name];
  }
  writeOhMyConfig(ohmy);
  console.log(`${chalk.green("✓")} ${t("removeSuccess", { type: t(target.type), name: target.name })}`);
  await pause();
}

async function interactiveProvider(): Promise<void> {
  const action = await select<string>({
    message: t("providerManage"),
    choices: [
      { name: t("providerView"), value: "view" },
      { name: t("providerAdd"), value: "add" },
      { name: t("providerAddModel"), value: "add-model" },
      { name: t("providerRemoveModel"), value: "remove-model" },
      { name: t("providerRemove"), value: "remove" },
      { name: t("providerBack"), value: "back" },
    ],
  pageSize: 20,
  });

  if (action === "back") return;

  const config = readOpenCodeConfig();
  const providerNames = Object.keys(config.provider ?? {});

  if (action === "view") {
    if (providerNames.length === 0) {
      console.log(formatWarning(t("noProviders")));
      await pause();
      return;
    }
    const name = await select<string>({
      message: t("providerSelect"),
      choices: [
        ...providerNames.map((n) => ({ name: `${chalk.cyan(n)} (${(config.provider?.[n]?.models && Object.keys(config.provider[n].models).length) ?? 0} ${t("models")})`, value: n })),
        { name: t("providerBack"), value: "__back__" },
      ],
    pageSize: 20,
    });
    if (name === "__back__") return;
    const p = config.provider![name];
    console.log();
    console.log(chalk.bold(`${t("providers")}: ${p.name ?? name}`));
    if (p.npm) console.log(`  ${t("providerDetailNPM")} ${p.npm}`);
    if (p.options?.baseURL) console.log(`  ${t("providerDetailURL")} ${p.options.baseURL}`);
    if (p.options?.apiKey) {
      const k = p.options.apiKey;
      console.log(`  ${t("providerDetailKey")} ${k.length > 12 ? k.slice(0, 8) + "..." + k.slice(-4) : "***"}`);
    }
    const modelKeys = Object.keys(p.models ?? {});
    if (modelKeys.length > 0) {
      const rows = modelKeys.map((id) => {
        const m = p.models![id];
        return [id, m.name ?? "-", formatContextSize(m.limit?.context), formatContextSize(m.limit?.output), m.options?.thinking?.type ?? "-"];
      });
      console.log();
      console.log(formatTable([t("colModelID"), t("colName"), t("colContext"), t("colOutput"), t("colThinking")], rows));
    }
    console.log();
    await pause();
    return;
  }

  if (action === "add") {
    const name = await input({ message: t("providerNameKey") });
    if (config.provider?.[name]) {
      console.log(formatWarning(t("providerExists", { name })));
      await pause();
      return;
    }
    const npm = await input({ message: t("providerNPM"), default: "" });
    const baseURL = await input({ message: t("providerBaseURL"), default: "" });
    const apiKey = await input({ message: t("providerAPIKey"), default: "" });
    if (!config.provider) config.provider = {};
    config.provider[name] = {
      ...(npm ? { npm } : {}),
      options: {
        ...(baseURL ? { baseURL } : {}),
        ...(apiKey ? { apiKey } : {}),
      },
      models: {},
    };
    writeOpenCodeConfig(config);
    console.log(`${chalk.green("✓")} ${t("providerAdded", { name })}`);
    await pause();
    return;
  }

  if (action === "add-model") {
    if (providerNames.length === 0) {
      console.log(formatWarning(t("noProviders")));
      await pause();
      return;
    }
    const providerName = await select<string>({
      message: t("providerSelect"),
      choices: [
        ...providerNames.map((n) => ({ name: chalk.cyan(n), value: n })),
        { name: t("providerBack"), value: "__back__" },
      ],
    pageSize: 20,
    });
    if (providerName === "__back__") return;
    const modelId = await input({ message: t("modelID") });
    const provider = config.provider![providerName];
    if (provider.models?.[modelId]) {
      console.log(formatWarning(t("modelExists", { id: modelId })));
      await pause();
      return;
    }
    const displayName = await input({ message: t("modelName"), default: modelId });
    const contextStr = await input({ message: t("modelContextWindow"), default: "" });
    const outputStr = await input({ message: t("modelMaxOutput"), default: "" });
    const hasThinking = await confirm({ message: t("modelThinkingQ"), default: false });

    if (!provider.models) provider.models = {};
    const modelCfg: ModelConfig = {
      name: displayName || modelId,
      ...(contextStr || outputStr ? {
        limit: {
          ...(contextStr ? { context: parseInt(contextStr, 10) } : {}),
          ...(outputStr ? { output: parseInt(outputStr, 10) } : {}),
        },
      } : {}),
      ...(hasThinking ? { options: { thinking: { type: "enabled" } } } : {}),
    };
    provider.models[modelId] = modelCfg;
    writeOpenCodeConfig(config);
    console.log(`${chalk.green("✓")} ${t("modelAdded", { id: modelId, provider: providerName })}`);
    await pause();
    return;
  }

  if (action === "remove-model") {
    if (providerNames.length === 0) {
      console.log(formatWarning(t("noProviders")));
      await pause();
      return;
    }
    const providerName = await select<string>({
      message: t("providerSelect"),
      choices: [
        ...providerNames.map((n) => ({ name: chalk.cyan(n), value: n })),
        { name: t("providerBack"), value: "__back__" },
      ],
    pageSize: 20,
    });
    if (providerName === "__back__") return;
    const provider = config.provider![providerName];
    const modelKeys = Object.keys(provider.models ?? {});
    if (modelKeys.length === 0) {
      console.log(formatWarning(t("providerNoModels")));
      await pause();
      return;
    }
    const modelId = await select<string>({
      message: t("modelRemoveSelect"),
      choices: [
        ...modelKeys.map((id) => ({ name: `${id} (${provider.models![id].name ?? id})`, value: id })),
        { name: t("providerBack"), value: "__back__" },
      ],
    pageSize: 20,
    });
    if (modelId === "__back__") return;
    const confirmed = await confirm({ message: t("modelRemoveConfirm", { id: modelId }), default: false });
    if (confirmed) {
      delete provider.models![modelId];
      writeOpenCodeConfig(config);
      console.log(`${chalk.green("✓")} ${t("modelRemoved", { id: modelId })}`);
    }
    await pause();
    return;
  }

  if (action === "remove") {
    if (providerNames.length === 0) {
      console.log(formatWarning(t("noProviders")));
      await pause();
      return;
    }
    const name = await select<string>({
      message: t("providerRemove"),
      choices: [
        ...providerNames.map((n) => ({ name: chalk.cyan(n), value: n })),
        { name: t("providerBack"), value: "__back__" },
      ],
    pageSize: 20,
    });
    if (name === "__back__") return;
    const confirmed = await confirm({ message: t("providerRemoveConfirm", { name }), default: false });
    if (confirmed) {
      delete config.provider![name];
      writeOpenCodeConfig(config);
      console.log(`${chalk.green("✓")} ${t("providerRemoved", { name })}`);
    }
    await pause();
    return;
  }
}

async function interactiveBackup(): Promise<void> {
  const action = await select<string>({
    message: t("backupMenuTitle"),
    pageSize: 20,
    choices: [
      { name: t("backupCreate"), value: "create" },
      { name: t("backupList"), value: "list" },
      { name: t("backupRestore"), value: "restore" },
      { name: t("backupDelete"), value: "delete" },
      { name: t("backupBack"), value: "back" },
    ],
  });

  if (action === "back") return;

  if (action === "create") {
    const label = await input({ message: t("backupLabel"), default: "" });
    const id = createBackup(label || undefined);
    console.log(`${chalk.green("✓")} ${t("backupCreated", { id })}`);
    await pause();
    return;
  }

  if (action === "list") {
    const backups = listBackups();
    if (backups.length === 0) {
      console.log(formatWarning(t("backupNone")));
      await pause();
      return;
    }
    const rows = backups.map((b) => [
      chalk.yellow(b.display),
      `${((b.opencodeSize + b.ohmySize) / 1024).toFixed(1)}KB`,
    ]);
    console.log(formatTable([t("backupColID"), t("backupColSize")], rows));
    console.log();
    await pause();
    return;
  }

  if (action === "restore") {
    const backups = listBackups();
    if (backups.length === 0) {
      console.log(formatWarning(t("backupNone")));
      await pause();
      return;
    }
    const target = await select<string>({
      message: t("backupSelectRestore"),
      pageSize: 20,
      choices: [
        ...backups.map((b) => ({
          name: `${chalk.yellow(b.display)} (${((b.opencodeSize + b.ohmySize) / 1024).toFixed(1)}KB)`,
          value: b.id,
        })),
        { name: t("providerBack"), value: "__back__" },
      ],
    });
    if (target === "__back__") return;
    const confirmed = await confirm({
      message: t("backupRestoreConfirm", { id: target }),
      default: false,
    });
    if (confirmed) {
      restoreBackup(target);
      console.log(`${chalk.green("✓")} ${t("backupRestored", { id: target })}`);
    } else {
      console.log(chalk.gray(t("cancelled")));
    }
    await pause();
    return;
  }

  if (action === "delete") {
    const backups = listBackups();
    if (backups.length === 0) {
      console.log(formatWarning(t("backupNone")));
      await pause();
      return;
    }
    const target = await select<string>({
      message: t("backupSelectDelete"),
      pageSize: 20,
      choices: [
        ...backups.map((b) => ({
          name: `${chalk.yellow(b.display)} (${((b.opencodeSize + b.ohmySize) / 1024).toFixed(1)}KB)`,
          value: b.id,
        })),
        { name: t("providerBack"), value: "__back__" },
      ],
    });
    if (target === "__back__") return;
    const confirmed = await confirm({
      message: t("backupDeleteConfirm", { id: target }),
      default: false,
    });
    if (confirmed) {
      deleteBackup(target);
      console.log(`${chalk.green("✓")} ${t("backupDeleted", { id: target })}`);
    } else {
      console.log(chalk.gray(t("cancelled")));
    }
    await pause();
    return;
  }
}

async function interactiveOcProvider(): Promise<void> {
  if (!isOpenCodeAvailable()) {
    console.log(formatWarning(t("ocProviderNotFound")));
    await pause();
    return;
  }

  const action = await select<string>({
    message: t("ocProviderTitle"),
    choices: [
      { name: t("ocProviderList"), value: "list" },
      { name: t("ocProviderLogin"), value: "login" },
      { name: t("ocProviderLogout"), value: "logout" },
      { name: t("ocProviderBack"), value: "back" },
    ],
    pageSize: 20,
  });

  if (action === "back") return;

  if (action === "list") {
    try {
      const output = runOpenCodeProvidersList();
      console.log(output);
    } catch (err) {
      console.log(formatError(t("ocProviderFailed", { error: (err as Error).message })));
    }
    console.log();
    const ohmy = readOhMyConfig();
    const targets = [
      ...Object.entries(ohmy.agents ?? {}).map(([n, e]) => ({ name: n, type: t("agent"), model: e.model, variant: e.variant })),
      ...Object.entries(ohmy.categories ?? {}).map(([n, e]) => ({ name: n, type: t("category"), model: e.model, variant: e.variant })),
    ];
    if (targets.length > 0) {
      const rows = targets.map((tgt) => [
        chalk.yellow(tgt.name),
        chalk.gray(tgt.type),
        chalk.cyan(tgt.model ?? "-"),
        tgt.variant ?? "-",
      ]);
      console.log(chalk.bold(t("modelAssignments")));
      console.log(formatTable([t("colName"), t("colType"), t("colModel"), t("colVariant")], rows));
      console.log();
    }
    await pause();
    return;
  }

  if (action === "login") {
    try {
      const output = runOpenCodeProvidersList();
      console.log(output);
      console.log();
    } catch {}
    const ohmyLogin = readOhMyConfig();
    const loginTargets = [
      ...Object.entries(ohmyLogin.agents ?? {}).map(([n, e]) => ({ name: n, type: t("agent"), model: e.model, variant: e.variant })),
      ...Object.entries(ohmyLogin.categories ?? {}).map(([n, e]) => ({ name: n, type: t("category"), model: e.model, variant: e.variant })),
    ];
    if (loginTargets.length > 0) {
      const rows = loginTargets.map((tgt) => [
        chalk.yellow(tgt.name),
        chalk.gray(tgt.type),
        chalk.cyan(tgt.model ?? "-"),
        tgt.variant ?? "-",
      ]);
      console.log(chalk.bold(t("modelAssignments")));
      console.log(formatTable([t("colName"), t("colType"), t("colModel"), t("colVariant")], rows));
      console.log();
    }
    console.log(chalk.gray(t("ocProviderRunning")));
    runOpenCodeProvidersLogin();
    await pause();
    return;
  }

  if (action === "logout") {
    try {
      const output = runOpenCodeProvidersList();
      console.log(output);
      console.log();
    } catch {}
    const ohmyLogout = readOhMyConfig();
    const logoutTargets = [
      ...Object.entries(ohmyLogout.agents ?? {}).map(([n, e]) => ({ name: n, type: t("agent"), model: e.model, variant: e.variant })),
      ...Object.entries(ohmyLogout.categories ?? {}).map(([n, e]) => ({ name: n, type: t("category"), model: e.model, variant: e.variant })),
    ];
    if (logoutTargets.length > 0) {
      const rows = logoutTargets.map((tgt) => [
        chalk.yellow(tgt.name),
        chalk.gray(tgt.type),
        chalk.cyan(tgt.model ?? "-"),
        tgt.variant ?? "-",
      ]);
      console.log(chalk.bold(t("modelAssignments")));
      console.log(formatTable([t("colName"), t("colType"), t("colModel"), t("colVariant")], rows));
      console.log();
    }
    const connected = Array.from(readConnectedProviders());
    if (connected.length === 0) {
      console.log(formatWarning(t("noProviders")));
      await pause();
      return;
    }
    const provider = await select<string>({
      message: t("ocProviderLogoutSelect"),
      choices: [
        ...connected.map((p) => ({ name: chalk.cyan(p), value: p })),
        { name: t("providerBack"), value: "__back__" },
      ],
      pageSize: 15,
    });
    if (provider === "__back__") return;
    console.log(chalk.gray(t("ocProviderRunning")));
    runOpenCodeProvidersLogout(provider);
    await pause();
    return;
  }
}

async function interactiveConfig(): Promise<void> {
  const action = await select<string>({
    message: t("configTitle"),
    choices: [
      { name: t("configShowOC"), value: "oc" },
      { name: t("configShowOhmy"), value: "ohmy" },
      { name: t("configShowBoth"), value: "both" },
      { name: t("configLookupPath"), value: "path" },
      { name: t("providerBack"), value: "back" },
    ],
  pageSize: 20,
  });

  if (action === "back") return;

  console.log();

  if (action === "oc" || action === "both") {
    console.log(chalk.bold(t("configShowOCFile")));
    console.log(formatJSON(readOpenCodeConfig()));
    console.log();
  }

  if (action === "ohmy" || action === "both") {
    console.log(chalk.bold(t("configShowOhmyFile")));
    console.log(formatJSON(readOhMyConfig()));
    console.log();
  }

  if (action === "path") {
    const pathExpr = await input({ message: t("configPathPrompt") });
    const oc = readOpenCodeConfig();
    let value: unknown = undefined;
    let source = "";

    const keys = pathExpr.split(".");
    let current: unknown = oc;
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== "object") { value = undefined; break; }
      current = (current as Record<string, unknown>)[key];
      value = current;
    }
    if (value !== undefined) source = t("configShowOCFile");

    if (value === undefined) {
      const ohmy = readOhMyConfig();
      current = ohmy;
      for (const key of keys) {
        if (current === null || current === undefined || typeof current !== "object") { value = undefined; break; }
        current = (current as Record<string, unknown>)[key];
        value = current;
      }
      if (value !== undefined) source = t("configShowOhmyFile");
    }

    if (value === undefined) {
      console.log(formatWarning(t("configPathNotFound", { path: pathExpr })));
    } else {
      console.log(chalk.gray(`[${source}]`));
      console.log(typeof value === "object" && value !== null ? formatJSON(value) : String(value));
    }
    console.log();
  }

  await pause();
}

async function interactiveLangSwitch(): Promise<void> {
  const current = getLang();
  const lang = await select<Lang | "__back__">({
    message: t("langSwitch"),
    choices: [
      { name: `${t("langZh")}${current === "zh" ? t("langCurrent") : ""}`, value: "zh" as Lang | "__back__" },
      { name: `${t("langEn")}${current === "en" ? t("langCurrent") : ""}`, value: "en" as Lang | "__back__" },
      { name: t("providerBack"), value: "__back__" as const },
    ],
  pageSize: 20,
  });

  if (lang === "__back__") return;

  setLang(lang);
  console.log(chalk.green(t("langChanged")));
  await pause();
}

export async function runInteractive(): Promise<void> {
  const currentVersion = getCurrentVersion();
  checkForUpdate(currentVersion).then((latest) => {
    if (latest) {
      console.log(chalk.yellow(t("updateAvailable", { current: currentVersion, latest })));
      console.log();
    }
  }).catch(() => {});

  let running = true;
  while (running) {
    try {
      console.clear();
      const action = await mainMenu(currentVersion);

      switch (action) {
        case "list":
          await safeRun(interactiveList);
          break;
        case "model-set":
          await safeRun(interactiveModelSet);
          break;
        case "model-remove":
          await safeRun(interactiveModelRemove);
          break;
        case "model-view":
          await safeRun(interactiveModelView);
          break;
        case "provider":
          await safeRun(interactiveProvider);
          break;
        case "oc-provider":
          await safeRun(interactiveOcProvider);
          break;
        case "config":
          await safeRun(interactiveConfig);
          break;
        case "backup":
          await safeRun(interactiveBackup);
          break;
        case "lang":
          await safeRun(interactiveLangSwitch);
          break;
        case "quit":
          running = false;
          break;
        default:
          running = false;
      }
    } catch (err) {
      if (isUserCancel(err)) {
        running = false;
      } else {
        console.log(chalk.red(`${t("error")}: ${(err as Error).message}`));
        await pause();
      }
    }
  }

  console.log(chalk.gray(t("bye")));
}

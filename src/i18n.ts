export type Lang = "zh" | "en";

let currentLang: Lang = (process.env.OC_LANG === "en" ? "en" : "zh") as Lang;

type Strings = {
  appTitle: string;
  bye: string;
  pressEnter: string;
  error: string;
  cancelled: string;

  mainMenuTitle: string;
  mainMenuList: string;
  mainMenuListDesc: string;
  mainMenuModelSet: string;
  mainMenuModelSetDesc: string;
  mainMenuModelRemove: string;
  mainMenuModelRemoveDesc: string;
  mainMenuModelView: string;
  mainMenuModelViewDesc: string;
  mainMenuProvider: string;
  mainMenuProviderDesc: string;
  mainMenuConfig: string;
  mainMenuConfigDesc: string;
  mainMenuQuit: string;

  listTitle: string;
  listAll: string;
  listProviders: string;
  listModels: string;
  listAgents: string;
  listCategories: string;

  providers: string;
  models: string;
  agents: string;
  categories: string;
  agent: string;
  category: string;
  source: string;
  noProviders: string;
  noModels: string;
  noAgents: string;
  noCategories: string;

  colName: string;
  colModelCount: string;
  colBaseURL: string;
  colProvider: string;
  colModelID: string;
  colDisplayName: string;
  colContext: string;
  colOutput: string;
  colThinking: string;
  colModel: string;
  colVariant: string;
  colAgent: string;
  colCategory: string;

  selectTarget: string;
  selectNewModel: string;
  currentModel: string;
  setVariantQ: string;
  variantName: string;
  setSuccess: string;

  noTargets: string;
  noModelsAvail: string;

  viewModelFor: string;
  display: string;

  removeSelectTarget: string;
  removeConfirm: string;
  removeSuccess: string;
  noAssignments: string;

  providerManage: string;
  providerView: string;
  providerAdd: string;
  providerAddModel: string;
  providerRemoveModel: string;
  providerRemove: string;
  providerBack: string;
  providerSelect: string;
  providerNameKey: string;
  providerNPM: string;
  providerBaseURL: string;
  providerAPIKey: string;
  providerExists: string;
  providerAdded: string;
  providerRemoveConfirm: string;
  providerRemoved: string;
  providerNoModels: string;

  modelID: string;
  modelName: string;
  modelExists: string;
  modelContextWindow: string;
  modelMaxOutput: string;
  modelThinkingQ: string;
  modelAdded: string;
  modelRemoveSelect: string;
  modelRemoveConfirm: string;
  modelRemoved: string;

  configTitle: string;
  configShowOC: string;
  configShowOhmy: string;
  configShowBoth: string;
  configLookupPath: string;
  configPathPrompt: string;
  configPathNotFound: string;

  modelGetAgent: string;
  modelGetCategory: string;
  modelGetAgentOC: string;
  modelNotFound: string;
  modelSetInvalid: string;
  modelSetProviderNotFound: string;
  modelSetModelNotFound: string;
  modelSetForceRequired: string;
  modelSetKnownAgents: string;
  modelSetKnownCategories: string;
  modelRemoveNotFound: string;
  modelRemovedAgent: string;
  modelRemovedCategory: string;

  switchInvalidType: string;

  providerNotFound: string;
  providerAvailable: string;
  providerKey: string;
  providerDetailNPM: string;
  providerDetailURL: string;
  providerDetailKey: string;
  providerNoModelsDetail: string;

  configShowOCFile: string;
  configShowOhmyFile: string;
  configNotFound: string;

  summaryProviders: string;
  summaryModels: string;
  summaryAgents: string;
  summaryCategories: string;
  summary: string;
  langSwitch: string;
  langSwitchDesc: string;
  langZh: string;
  langEn: string;
  langCurrent: string;
  langChanged: string;
  backupCreate: string;
  backupCreateDesc: string;
  backupList: string;
  backupRestore: string;
  backupDelete: string;
  backupBack: string;
  backupMenuTitle: string;
  backupCreated: string;
  backupRestoreConfirm: string;
  backupRestored: string;
  backupDeleteConfirm: string;
  backupDeleted: string;
  backupNone: string;
  backupLabel: string;
  backupColID: string;
  backupColSize: string;
  backupSelectRestore: string;
  backupSelectDelete: string;

  ocProviderTitle: string;
  ocProviderList: string;
  ocProviderLogin: string;
  ocProviderLogout: string;
  ocProviderLogoutSelect: string;
  ocProviderBack: string;
  ocProviderRunning: string;
  ocProviderSuccess: string;
  ocProviderFailed: string;
  ocProviderNotFound: string;
  ocProviderMenuDesc: string;

  updateAvailable: string;
  updateCurrent: string;
  updateNewer: string;
  updateLatest: string;
  updateCheckFailed: string;
};

const zh: Strings = {
  appTitle: "OC Helper",
  bye: "再见。",
  pressEnter: "按回车键继续...",
  error: "错误",
  cancelled: "已取消。",

  mainMenuTitle: "你想做什么？",
  mainMenuList: "查看当前配置",
  mainMenuListDesc: "列出提供商、模型、智能体、分类",
  mainMenuModelSet: "设置智能体/分类的模型",
  mainMenuModelSetDesc: "选择目标并选择模型",
  mainMenuModelRemove: "删除智能体/分类配置",
  mainMenuModelRemoveDesc: "移除模型分配",
  mainMenuModelView: "查看模型分配",
  mainMenuModelViewDesc: "查看每个智能体/分类使用的模型",
  mainMenuProvider: "管理提供商",
  mainMenuProviderDesc: "添加、删除或查看提供商和模型",
  mainMenuConfig: "查看原始配置文件",
  mainMenuConfigDesc: "显示 opencode.json 和 oh-my-openagent.json",
  mainMenuQuit: "退出",

  listTitle: "查看什么？",
  listAll: "全部（概览）",
  listProviders: "提供商",
  listModels: "模型",
  listAgents: "智能体",
  listCategories: "分类",

  providers: "提供商",
  models: "模型",
  agents: "智能体",
  categories: "分类",
  agent: "智能体",
  category: "分类",
  source: "来源",
  noProviders: "尚未配置提供商。",
  noModels: "未找到模型。",
  noAgents: "尚未配置智能体。",
  noCategories: "尚未配置分类。",

  colName: "名称",
  colModelCount: "模型数",
  colBaseURL: "接口地址",
  colProvider: "提供商",
  colModelID: "模型ID",
  colDisplayName: "显示名称",
  colContext: "上下文",
  colOutput: "输出",
  colThinking: "思维链",
  colModel: "模型",
  colVariant: "变体",
  colAgent: "智能体",
  colCategory: "分类",

  selectTarget: "选择要修改的目标：",
  selectNewModel: "为 {type} {name} 选择新模型：",
  currentModel: "当前模型：{model}",
  setVariantQ: "设置变体？",
  variantName: "变体名称（如 high、medium、xhigh）：",
  setSuccess: "已将 {type} {name} 设置为 {model}",

  noTargets: "尚未配置智能体或分类。",
  noModelsAvail: "opencode.json 提供商中没有可用模型。",

  viewModelFor: "查看模型分配：",
  display: "显示名：",

  removeSelectTarget: "选择要删除的配置：",
  removeConfirm: "删除 {type} \"{name}\"？",
  removeSuccess: "已删除 {type} {name}",
  noAssignments: "没有可删除的智能体或分类配置。",

  providerManage: "提供商管理：",
  providerView: "查看提供商详情",
  providerAdd: "添加新提供商",
  providerAddModel: "向提供商添加模型",
  providerRemoveModel: "从提供商删除模型",
  providerRemove: "删除提供商",
  providerBack: "返回",
  providerSelect: "选择提供商：",
  providerNameKey: "提供商名称（键名）：",
  providerNPM: "NPM 包（如 @ai-sdk/anthropic）：",
  providerBaseURL: "接口地址：",
  providerAPIKey: "API 密钥：",
  providerExists: "提供商 \"{name}\" 已存在。",
  providerAdded: "已添加提供商 {name}",
  providerRemoveConfirm: "删除提供商 \"{name}\" 及其所有模型？",
  providerRemoved: "已删除提供商 {name}",
  providerNoModels: "该提供商没有配置模型。",

  modelID: "模型 ID：",
  modelName: "显示名称：",
  modelExists: "模型 \"{id}\" 已存在。",
  modelContextWindow: "上下文窗口大小（tokens，留空跳过）：",
  modelMaxOutput: "最大输出（tokens，留空跳过）：",
  modelThinkingQ: "启用思维链？",
  modelAdded: "已将模型 {id} 添加到提供商 {provider}",
  modelRemoveSelect: "选择要删除的模型：",
  modelRemoveConfirm: "删除模型 \"{id}\"？",
  modelRemoved: "已删除模型 {id}",

  configTitle: "查看配置：",
  configShowOC: "显示 opencode.json",
  configShowOhmy: "显示 oh-my-openagent.json",
  configShowBoth: "显示全部",
  configLookupPath: "按路径查找",
  configPathPrompt: "点分路径（如 provider.minimax.options.baseURL）：",
  configPathNotFound: "路径 \"{path}\" 未找到。",

  modelGetAgent: "智能体 {name} 正在使用 {model}",
  modelGetCategory: "分类 {name} 正在使用 {model}",
  modelGetAgentOC: "智能体 {name} 正在使用 {model}",
  modelNotFound: "在智能体或分类中未找到 \"{name}\"。",
  modelSetInvalid: "模型引用 \"{ref}\" 格式无效。格式：provider/model",
  modelSetProviderNotFound: "提供商 \"{name}\" 未找到。可用：{list}",
  modelSetModelNotFound: "模型 \"{id}\" 在提供商 \"{provider}\" 下未找到，仍然设置。",
  modelSetForceRequired: "\"{name}\" 尚不存在。使用 --force 创建为 {type}，或指定已有目标。",
  modelSetKnownAgents: "已有智能体：{list}",
  modelSetKnownCategories: "已有分类：{list}",
  modelRemoveNotFound: "在智能体或分类中未找到 \"{name}\"。",
  modelRemovedAgent: "已删除智能体 {name}",
  modelRemovedCategory: "已删除分类 {name}",

  switchInvalidType: "类型必须是 \"agent\" 或 \"category\"，实际为 \"{type}\"",

  providerNotFound: "提供商 \"{name}\" 未找到。可用：{list}",
  providerAvailable: "可用：{list}",
  providerKey: "键名：",
  providerDetailNPM: "NPM包：",
  providerDetailURL: "接口地址：",
  providerDetailKey: "API密钥：",
  providerNoModelsDetail: "该提供商没有配置模型。",

  configShowOCFile: "opencode.json",
  configShowOhmyFile: "oh-my-openagent.json",
  configNotFound: "路径 \"{path}\" 在两个配置文件中均未找到。",

  summaryProviders: "提供商：",
  summaryModels: "模型：",
  summaryAgents: "智能体：",
  summaryCategories: "分类：",
  summary: "概览",
  langSwitch: "切换语言 / Switch Language",
  langSwitchDesc: "切换界面显示语言",
  langZh: "中文",
  langEn: "English",
  langCurrent: "（当前）",
  langChanged: "语言已切换为中文",
  backupCreate: "创建备份",
  backupCreateDesc: "备份当前配置文件",
  backupList: "查看备份列表",
  backupRestore: "恢复备份",
  backupDelete: "删除备份",
  backupBack: "返回",
  backupMenuTitle: "备份管理：",
  backupCreated: "已创建备份 {id}",
  backupRestoreConfirm: "恢复备份 \"{id}\"？当前配置将被覆盖。",
  backupRestored: "已恢复备份 {id}",
  backupDeleteConfirm: "删除备份 \"{id}\"？",
  backupDeleted: "已删除备份 {id}",
  backupNone: "没有备份。",
  backupLabel: "备份标签（留空跳过）：",
  backupColID: "备份ID",
  backupColSize: "大小",
  backupSelectRestore: "选择要恢复的备份：",
  backupSelectDelete: "选择要删除的备份：",

  ocProviderTitle: "OpenCode 内置提供商管理",
  ocProviderList: "查看内置提供商列表",
  ocProviderLogin: "登录提供商",
  ocProviderLogout: "登出提供商",
  ocProviderLogoutSelect: "选择要登出的提供商",
  ocProviderBack: "返回",
  ocProviderRunning: "正在执行...",
  ocProviderSuccess: "命令执行完成。",
  ocProviderFailed: "命令执行失败：{error}",
  ocProviderNotFound: "未找到 opencode 命令，请确认已安装 OpenCode。",
  ocProviderMenuDesc: "通过 opencode providers 命令管理内置提供商",

  updateAvailable: "🚀 新版本可用：{current} → {latest}，运行 npm i -g oc-helper-cli 更新",
  updateCurrent: "当前版本：{version}",
  updateNewer: "已是最新版本 ✓",
  updateLatest: "检测更新中...",
  updateCheckFailed: "检测更新失败",
};

const en: Strings = {
  appTitle: "OC Helper",
  bye: "Bye.",
  pressEnter: "Press Enter to continue...",
  error: "Error",
  cancelled: "Cancelled.",

  mainMenuTitle: "What do you want to do?",
  mainMenuList: "View current configuration",
  mainMenuListDesc: "List providers, models, agents, categories",
  mainMenuModelSet: "Set model for agent/category",
  mainMenuModelSetDesc: "Pick a target and choose a model",
  mainMenuModelRemove: "Remove agent/category assignment",
  mainMenuModelRemoveDesc: "Delete a model assignment",
  mainMenuModelView: "View model assignments",
  mainMenuModelViewDesc: "See which model each agent/category uses",
  mainMenuProvider: "Manage providers",
  mainMenuProviderDesc: "Add, remove, or view providers and models",
  mainMenuConfig: "View raw config files",
  mainMenuConfigDesc: "Show opencode.json and oh-my-openagent.json",
  mainMenuQuit: "Quit",

  listTitle: "What to list?",
  listAll: "All (summary)",
  listProviders: "Providers",
  listModels: "Models",
  listAgents: "Agents",
  listCategories: "Categories",

  providers: "Providers",
  models: "Models",
  agents: "Agents",
  categories: "Categories",
  agent: "agent",
  category: "category",
  source: "Source",
  noProviders: "No providers configured.",
  noModels: "No models found.",
  noAgents: "No agents configured.",
  noCategories: "No categories configured.",

  colName: "Name",
  colModelCount: "# Models",
  colBaseURL: "Base URL",
  colProvider: "Provider",
  colModelID: "Model ID",
  colDisplayName: "Display Name",
  colContext: "Context",
  colOutput: "Output",
  colThinking: "Thinking",
  colModel: "Model",
  colVariant: "Variant",
  colAgent: "Agent",
  colCategory: "Category",

  selectTarget: "Select target to modify:",
  selectNewModel: "Select new model for {type} {name}:",
  currentModel: "Current model: {model}",
  setVariantQ: "Set a variant?",
  variantName: "Variant name (e.g. high, medium, xhigh):",
  setSuccess: "Set {type} {name} to {model}",

  noTargets: "No agents or categories configured yet.",
  noModelsAvail: "No models available in opencode.json providers.",

  viewModelFor: "View model for:",
  display: "Display:",

  removeSelectTarget: "Select assignment to remove:",
  removeConfirm: "Remove {type} \"{name}\"?",
  removeSuccess: "Removed {type} {name}",
  noAssignments: "No agent or category assignments to remove.",

  providerManage: "Provider management:",
  providerView: "View provider details",
  providerAdd: "Add new provider",
  providerAddModel: "Add model to provider",
  providerRemoveModel: "Remove model from provider",
  providerRemove: "Remove provider",
  providerBack: "Back",
  providerSelect: "Select provider:",
  providerNameKey: "Provider name (key):",
  providerNPM: "NPM package (e.g. @ai-sdk/anthropic):",
  providerBaseURL: "Base URL:",
  providerAPIKey: "API key:",
  providerExists: "Provider \"{name}\" already exists.",
  providerAdded: "Added provider {name}",
  providerRemoveConfirm: "Remove provider \"{name}\" and all its models?",
  providerRemoved: "Removed provider {name}",
  providerNoModels: "No models configured for this provider.",

  modelID: "Model ID:",
  modelName: "Display name:",
  modelExists: "Model \"{id}\" already exists.",
  modelContextWindow: "Context window (tokens, leave empty to skip):",
  modelMaxOutput: "Max output (tokens, leave empty to skip):",
  modelThinkingQ: "Enable thinking?",
  modelAdded: "Added model {id} to provider {provider}",
  modelRemoveSelect: "Select model to remove:",
  modelRemoveConfirm: "Remove model \"{id}\"?",
  modelRemoved: "Removed model {id}",

  configTitle: "View configuration:",
  configShowOC: "Show opencode.json",
  configShowOhmy: "Show oh-my-openagent.json",
  configShowBoth: "Show both",
  configLookupPath: "Look up by path",
  configPathPrompt: "Dot-notation path (e.g. provider.minimax.options.baseURL):",
  configPathNotFound: "Path \"{path}\" not found.",

  modelGetAgent: "Agent {name} is using {model}",
  modelGetCategory: "Category {name} is using {model}",
  modelGetAgentOC: "Agent {name} is using {model}",
  modelNotFound: "\"{name}\" not found in agents or categories.",
  modelSetInvalid: "Invalid model reference \"{ref}\". Expected format: provider/model",
  modelSetProviderNotFound: "Provider \"{name}\" not found. Available: {list}",
  modelSetModelNotFound: "Model \"{id}\" not found under \"{provider}\". Setting anyway.",
  modelSetForceRequired: "\"{name}\" does not exist yet. Use --force to create as {type}, or specify an existing target.",
  modelSetKnownAgents: "Known agents: {list}",
  modelSetKnownCategories: "Known categories: {list}",
  modelRemoveNotFound: "\"{name}\" not found in agents or categories.",
  modelRemovedAgent: "Removed agent {name}",
  modelRemovedCategory: "Removed category {name}",

  switchInvalidType: "Type must be \"agent\" or \"category\", got \"{type}\"",

  providerNotFound: "Provider \"{name}\" not found. Available: {list}",
  providerAvailable: "Available: {list}",
  providerKey: "Key:",
  providerDetailNPM: "NPM Package:",
  providerDetailURL: "Base URL:",
  providerDetailKey: "API Key:",
  providerNoModelsDetail: "No models configured for this provider.",

  configShowOCFile: "opencode.json",
  configShowOhmyFile: "oh-my-openagent.json",
  configNotFound: "Path \"{path}\" not found in either config file.",

  summaryProviders: "Providers:",
  summaryModels: "Models:",
  summaryAgents: "Agents:",
  summaryCategories: "Categories:",
  summary: "Summary",
  langSwitch: "Switch Language / 切换语言",
  langSwitchDesc: "Change the interface language",
  langZh: "中文",
  langEn: "English",
  langCurrent: " (current)",
  langChanged: "Language switched to English",
  backupCreate: "Create backup",
  backupCreateDesc: "Backup current config files",
  backupList: "List backups",
  backupRestore: "Restore backup",
  backupDelete: "Delete backup",
  backupBack: "Back",
  backupMenuTitle: "Backup management:",
  backupCreated: "Created backup {id}",
  backupRestoreConfirm: "Restore backup \"{id}\"? Current config will be overwritten.",
  backupRestored: "Restored backup {id}",
  backupDeleteConfirm: "Delete backup \"{id}\"?",
  backupDeleted: "Deleted backup {id}",
  backupNone: "No backups found.",
  backupLabel: "Backup label (leave empty to skip):",
  backupColID: "Backup ID",
  backupColSize: "Size",
  backupSelectRestore: "Select backup to restore:",
  backupSelectDelete: "Select backup to delete:",

  ocProviderTitle: "OpenCode built-in provider management",
  ocProviderList: "List built-in providers",
  ocProviderLogin: "Login to a provider",
  ocProviderLogout: "Logout from a provider",
  ocProviderLogoutSelect: "Select provider to logout from",
  ocProviderBack: "Back",
  ocProviderRunning: "Running...",
  ocProviderSuccess: "Command completed.",
  ocProviderFailed: "Command failed: {error}",
  ocProviderNotFound: "opencode command not found. Please install OpenCode first.",
  ocProviderMenuDesc: "Manage built-in providers via opencode providers command",

  updateAvailable: "🚀 Update available: {current} → {latest}. Run: npm i -g oc-helper-cli",
  updateCurrent: "Current version: {version}",
  updateNewer: "Already up to date ✓",
  updateLatest: "Checking for updates...",
  updateCheckFailed: "Update check failed",
};

const translations: Record<Lang, Strings> = { zh, en };

export function t(key: keyof Strings, params?: Record<string, string>): string {
  let str = translations[currentLang][key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
}

export function langLabel(lang: Lang): string {
  return lang === "zh" ? t("langZh") : t("langEn");
}

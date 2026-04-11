<div align="center">

# OC Helper

**OpenCode 配置管理 CLI 工具**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/badge/npm-oc--helper--cli-red.svg)](https://www.npmjs.com/package/oc-helper-cli)

一个用于管理 [OpenCode](https://github.com/opencode-ai/opencode) 和 [Oh-My-OpenCode](https://github.com/nicepkg/oh-my-opencode) 配置文件的命令行工具。支持交互式操作和命令行参数两种模式，默认中文界面，支持中英文切换。

**[English Documentation](./README_EN.md)**

</div>

---

### 🎯 OC Helper 是什么？

OC Helper 是一个轻量级的命令行工具，帮助你轻松管理 OpenCode 和 Oh-My-OpenCode 的配置文件。无论你是想切换 AI 模型、管理提供商（Provider）、还是备份和恢复配置，OC Helper 都能让你通过简单的交互式菜单或命令行参数完成操作。

### ✨ 功能特性

- **📋 配置查看** — 列出所有提供商（Provider）、模型（Model）、智能体（Agent）、分类（Category）的配置
- **🔄 模型切换** — 交互式为智能体或分类选择 AI 模型
- **➕ 模型管理** — 添加/删除模型定义、添加/删除提供商
- **💾 备份恢复** — 创建配置备份，一键恢复到任意历史版本
- **🌐 中英双语** — 默认中文界面，支持运行时切换语言
- **🖥️ 双模式** — 交互式菜单模式（默认）和命令行参数模式

### 📦 安装

#### 前置条件

- [Node.js](https://nodejs.org/) 18 或更高版本
- 已安装并配置好 [OpenCode](https://github.com/opencode-ai/opencode)

#### 通过 npm 安装（推荐）

```bash
npm install -g oc-helper-cli
```

#### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/GuoJiafeng/oc-helper.git
cd oc-helper

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 全局链接
npm link
```

安装完成后，你可以通过 `oc-helper-cli` 命令来使用 OC Helper。

### 🚀 快速开始

#### 交互式模式（推荐）

直接运行 `oc-helper-cli` 命令即可进入交互式菜单：

```bash
oc-helper-cli
```

你会看到如下主菜单：

```
  OC Helper

? 你想做什么？
❯ 查看当前配置
  设置智能体/分类的模型
  删除智能体/分类配置
  查看模型分配
  管理提供商
  查看原始配置文件
  创建备份
  切换语言 / Switch Language
  退出
```

使用方向键选择操作，按回车确认。

#### 命令行模式

如果你更喜欢用命令行参数直接操作，OC Helper 也支持完整的 CLI 命令：

```bash
# 查看配置概览
oc-helper-cli list

# 查看特定类型的配置
oc-helper-cli list providers
oc-helper-cli list models
oc-helper-cli list agents
oc-helper-cli list categories

# 查看某个智能体/分类当前使用的模型
oc-helper-cli model get build
oc-helper-cli model get visual-engineering

# 为智能体/分类设置模型
oc-helper-cli model set build minimax/MiniMax-M2.1-highspeed
oc-helper-cli model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# 交互式选择模型
oc-helper-cli switch agent build
oc-helper-cli switch category visual-engineering

# 删除智能体/分类的模型分配
oc-helper-cli model remove build

# 查看提供商详情
oc-helper-cli provider show minimax

# 添加新提供商
oc-helper-cli provider add myprovider --base-url https://api.example.com --api-key sk-xxx

# 删除提供商
oc-helper-cli provider remove myprovider

# 向提供商添加模型定义
oc-helper-cli model-def add minimax MiniMax-M2.1-highspeed --name "MiniMax M2.1" --context 1000000 --output 8192

# 从提供商删除模型定义
oc-helper-cli model-def remove minimax MiniMax-M2.1-highspeed

# 查看原始配置文件
oc-helper-cli config show

# 按路径查找配置值
oc-helper-cli config get provider.minimax.options.baseURL

# 备份管理
oc-helper-cli backup create              # 创建备份（可选标签）
oc-helper-cli backup create before-test  # 创建带标签的备份
oc-helper-cli backup list                # 列出所有备份
oc-helper-cli backup restore <id>        # 恢复指定备份
oc-helper-cli backup delete <id>         # 删除指定备份
```

### 📖 详细使用说明

#### 1. 配置文件说明

OC Helper 管理以下两个配置文件：

| 文件 | 路径 | 说明 |
|------|------|------|
| `opencode.json` | `~/.config/opencode/opencode.json` | OpenCode 主配置文件，包含提供商定义、模型配置、API 密钥等 |
| `oh-my-openagent.json` | `~/.config/opencode/oh-my-openagent.json` | Oh-My-OpenCode 配置文件，定义智能体和分类的模型分配 |

#### 2. 提供商（Provider）管理

提供商是 OpenCode 中 AI 模型的来源。每个提供商可以包含多个模型。

```bash
# 查看所有提供商
oc-helper-cli list providers

# 查看某个提供商的详细信息（包含所有模型）
oc-helper-cli provider show minimax

# 添加新提供商
oc-helper-cli provider add myprovider --npm @ai-sdk/myprovider --base-url https://api.example.com

# 删除提供商（及其所有模型）
oc-helper-cli provider remove myprovider
```

#### 3. 模型（Model）管理

模型归属于提供商，使用 `provider/model-id` 格式引用。

```bash
# 查看所有模型
oc-helper-cli list models

# 向提供商添加新模型
oc-helper-cli model-def add minimax NewModel-v1 \
  --name "MiniMax New Model v1" \
  --context 1000000 \
  --output 8192 \
  --thinking enabled

# 从提供商删除模型
oc-helper-cli model-def remove minimax NewModel-v1
```

#### 4. 智能体（Agent）与分类（Category）模型分配

OpenCode 和 Oh-My-OpenCode 通过智能体和分类来组织 AI 模型的分配。

**智能体（Agent）** 包括：`build`, `oracle`, `librarian`, `explore`, `sisyphus-junior`, `plan` 等。

**分类（Category）** 包括：`visual-engineering`, `ultrabrain`, `deep`, `quick`, `writing` 等。

```bash
# 查看智能体当前使用的模型
oc-helper-cli model get build

# 为智能体设置模型
oc-helper-cli model set build minimax/MiniMax-M2.1-highspeed

# 为分类设置模型
oc-helper-cli model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# 交互式选择模型（推荐）
oc-helper-cli switch agent build
oc-helper-cli switch category visual-engineering

# 删除模型分配
oc-helper-cli model remove build

# 查看所有智能体和分类的分配情况
oc-helper-cli list agents
oc-helper-cli list categories
```

#### 5. 备份与恢复

备份功能可以保存当前配置的完整快照，方便在修改配置前创建安全点。

```bash
# 创建备份
oc-helper-cli backup create

# 创建带标签的备份（方便识别）
oc-helper-cli backup create before-upgrade

# 查看所有备份
oc-helper-cli backup list

# 恢复备份（⚠️ 会覆盖当前配置）
oc-helper-cli backup restore 20260411_103313_before-upgrade

# 删除备份
oc-helper-cli backup delete 20260411_103313_before-upgrade
```

备份文件存储在 `~/.config/opencode/backups/` 目录下。

#### 6. 语言切换

OC Helper 默认使用中文界面。你可以通过以下方式切换语言：

**交互式菜单：** 在主菜单中选择 "切换语言 / Switch Language"

**环境变量：**

```bash
# 使用英文界面
OC_LANG=en oc-helper-cli list

# 使用中文界面（默认）
oc-helper-cli list
```

### 🏗️ 项目结构

```
oc-helper/
├── src/
│   ├── index.ts          # CLI 入口点，命令定义与路由
│   ├── interactive.ts    # 交互式菜单系统
│   ├── config.ts         # 配置文件读写
│   ├── display.ts        # 终端输出格式化（表格、JSON、颜色）
│   ├── i18n.ts           # 国际化（中英双语）
│   ├── backup.ts         # 备份创建/恢复/删除
│   ├── switch.ts         # 交互式模型切换
│   └── types.ts          # TypeScript 类型定义
├── package.json
├── tsconfig.json
├── README.md
└── README_EN.md
```

### 🛠️ 技术栈

- **[TypeScript](https://www.typescriptlang.org/)** — 类型安全的 JavaScript 超集
- **[Commander.js](https://github.com/tj/commander.js)** — Node.js CLI 框架
- **[Inquirer.js](https://github.com/SBoudrias/Inquirer.js)** — 交互式命令行界面
- **[Chalk](https://github.com/chalk/chalk)** — 终端颜色输出

### 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/my-feature`
3. 提交改动：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/my-feature`
5. 提交 Pull Request

### 📄 许可证

[MIT License](LICENSE)

---

<div align="center">

**关键词：** OpenCode, Oh-My-OpenCode, CLI 工具, 配置管理, AI 模型管理, 模型切换, 命令行工具, 智能体模型配置, 提供商管理, 模型切换工具, opencode.json, oh-my-openagent.json, 备份恢复, Node.js CLI, TypeScript CLI, OpenCode 助手, opencode 配置, opencode 模型, opencode 提供商, opencode 智能体, opencode 分类, AI 编程助手配置, 大语言模型管理, LLM model management

</div>

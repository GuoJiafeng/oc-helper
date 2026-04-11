<div align="center">

# OC Helper

**OpenCode 配置管理 CLI 工具** | **OpenCode Configuration Management CLI Tool**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于管理 [OpenCode](https://github.com/opencode-ai/opencode) 和 [Oh-My-OpenCode](https://github.com/nicepkg/oh-my-opencode) 配置文件的命令行工具。支持交互式操作和命令行参数两种模式，默认中文界面，支持中英文切换。

A CLI tool for managing [OpenCode](https://github.com/opencode-ai/opencode) and [Oh-My-OpenCode](https://github.com/nicepkg/oh-my-opencode) configuration files. Supports both interactive and command-line modes with Chinese/English bilingual interface.

[English Documentation](#english-documentation) | [中文文档](#中文文档)

</div>

---

## 中文文档

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

#### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/GuoJiafeng/oc-helper.git
cd oc-helper

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 全局链接（可选，方便在任何位置使用 oc 命令）
npm link
```

安装完成后，你可以通过 `oc` 命令来使用 OC Helper。

### 🚀 快速开始

#### 交互式模式（推荐）

直接运行 `oc` 命令即可进入交互式菜单：

```bash
oc
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
oc list

# 查看特定类型的配置
oc list providers
oc list models
oc list agents
oc list categories

# 查看某个智能体/分类当前使用的模型
oc model get build
oc model get visual-engineering

# 为智能体/分类设置模型
oc model set build minimax/MiniMax-M2.1-highspeed
oc model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# 交互式选择模型
oc switch agent build
oc switch category visual-engineering

# 删除智能体/分类的模型分配
oc model remove build

# 查看提供商详情
oc provider show minimax

# 添加新提供商
oc provider add myprovider --base-url https://api.example.com --api-key sk-xxx

# 删除提供商
oc provider remove myprovider

# 向提供商添加模型定义
oc model-def add minimax MiniMax-M2.1-highspeed --name "MiniMax M2.1" --context 1000000 --output 8192

# 从提供商删除模型定义
oc model-def remove minimax MiniMax-M2.1-highspeed

# 查看原始配置文件
oc config show

# 按路径查找配置值
oc config get provider.minimax.options.baseURL

# 备份管理
oc backup create              # 创建备份（可选标签）
oc backup create before-test  # 创建带标签的备份
oc backup list                # 列出所有备份
oc backup restore <id>        # 恢复指定备份
oc backup delete <id>         # 删除指定备份
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
oc list providers

# 查看某个提供商的详细信息（包含所有模型）
oc provider show minimax

# 添加新提供商
oc provider add myprovider --npm @ai-sdk/myprovider --base-url https://api.example.com

# 删除提供商（及其所有模型）
oc provider remove myprovider
```

#### 3. 模型（Model）管理

模型归属于提供商，使用 `provider/model-id` 格式引用。

```bash
# 查看所有模型
oc list models

# 向提供商添加新模型
oc model-def add minimax NewModel-v1 \
  --name "MiniMax New Model v1" \
  --context 1000000 \
  --output 8192 \
  --thinking enabled

# 从提供商删除模型
oc model-def remove minimax NewModel-v1
```

#### 4. 智能体（Agent）与分类（Category）模型分配

OpenCode 和 Oh-My-OpenCode 通过智能体和分类来组织 AI 模型的分配。

**智能体（Agent）** 包括：`build`, `oracle`, `librarian`, `explore`, `sisyphus-junior`, `plan` 等。

**分类（Category）** 包括：`visual-engineering`, `ultrabrain`, `deep`, `quick`, `writing` 等。

```bash
# 查看智能体当前使用的模型
oc model get build

# 为智能体设置模型
oc model set build minimax/MiniMax-M2.1-highspeed

# 为分类设置模型
oc model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# 交互式选择模型（推荐）
oc switch agent build
oc switch category visual-engineering

# 删除模型分配
oc model remove build

# 查看所有智能体和分类的分配情况
oc list agents
oc list categories
```

#### 5. 备份与恢复

备份功能可以保存当前配置的完整快照，方便在修改配置前创建安全点。

```bash
# 创建备份
oc backup create

# 创建带标签的备份（方便识别）
oc backup create before-upgrade

# 查看所有备份
oc backup list

# 恢复备份（⚠️ 会覆盖当前配置）
oc backup restore 20260411_103313_before-upgrade

# 删除备份
oc backup delete 20260411_103313_before-upgrade
```

备份文件存储在 `~/.config/opencode/backups/` 目录下。

#### 6. 语言切换

OC Helper 默认使用中文界面。你可以通过以下方式切换语言：

**交互式菜单：** 在主菜单中选择 "切换语言 / Switch Language"

**环境变量：**

```bash
# 使用英文界面
OC_LANG=en oc list

# 使用中文界面（默认）
oc list
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
└── README.md
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

## English Documentation

### 🎯 What is OC Helper?

OC Helper is a lightweight CLI tool that helps you manage configuration files for [OpenCode](https://github.com/opencode-ai/opencode) and [Oh-My-OpenCode](https://github.com/nicepkg/oh-my-opencode). Whether you want to switch AI models, manage providers, or backup and restore configurations, OC Helper lets you do it all through a simple interactive menu or command-line arguments.

### ✨ Features

- **📋 Configuration Viewing** — List all providers, models, agents, and categories
- **🔄 Model Switching** — Interactively select AI models for agents or categories
- **➕ Model Management** — Add/remove model definitions and providers
- **💾 Backup & Restore** — Create configuration snapshots and restore to any point in history
- **🌐 Bilingual** — Chinese by default, with runtime language switching to English
- **🖥️ Dual Mode** — Interactive menu mode (default) and command-line argument mode

### 📦 Installation

#### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [OpenCode](https://github.com/opencode-ai/opencode) installed and configured

#### Install from Source

```bash
# Clone the repository
git clone https://github.com/GuoJiafeng/oc-helper.git
cd oc-helper

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally (optional, for using `oc` command anywhere)
npm link
```

After installation, use the `oc` command to run OC Helper.

### 🚀 Quick Start

#### Interactive Mode (Recommended)

Simply run `oc` to enter the interactive menu:

```bash
oc
```

You'll see the main menu:

```
  OC Helper

? What do you want to do?
❯ View current configuration
  Set model for agent/category
  Remove agent/category assignment
  View model assignments
  Manage providers
  View raw config files
  Create backup
  Switch Language / 切换语言
  Quit
```

Use arrow keys to navigate and Enter to select.

#### Command-Line Mode

OC Helper also supports full CLI commands for direct operations:

```bash
# View configuration summary
oc list

# View specific configuration types
oc list providers
oc list models
oc list agents
oc list categories

# Check which model an agent/category is using
oc model get build
oc model get visual-engineering

# Set model for an agent/category
oc model set build minimax/MiniMax-M2.1-highspeed
oc model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# Interactive model selection
oc switch agent build
oc switch category visual-engineering

# Remove an agent/category model assignment
oc model remove build

# View provider details
oc provider show minimax

# Add a new provider
oc provider add myprovider --base-url https://api.example.com --api-key sk-xxx

# Remove a provider
oc provider remove myprovider

# Add model definition to a provider
oc model-def add minimax MiniMax-M2.1-highspeed --name "MiniMax M2.1" --context 1000000 --output 8192

# Remove model definition from a provider
oc model-def remove minimax MiniMax-M2.1-highspeed

# View raw config files
oc config show

# Look up a config value by path
oc config get provider.minimax.options.baseURL

# Backup management
oc backup create              # Create a backup (optional label)
oc backup create before-test  # Create a labeled backup
oc backup list                # List all backups
oc backup restore <id>        # Restore from a backup
oc backup delete <id>         # Delete a backup
```

### 📖 Detailed Usage

#### 1. Configuration Files

OC Helper manages two configuration files:

| File | Path | Description |
|------|------|-------------|
| `opencode.json` | `~/.config/opencode/opencode.json` | OpenCode main config — providers, models, API keys |
| `oh-my-openagent.json` | `~/.config/opencode/oh-my-openagent.json` | Oh-My-OpenCode config — agent and category model assignments |

#### 2. Provider Management

Providers are the sources of AI models in OpenCode. Each provider can contain multiple models.

```bash
# List all providers
oc list providers

# View details of a specific provider (including all models)
oc provider show minimax

# Add a new provider
oc provider add myprovider --npm @ai-sdk/myprovider --base-url https://api.example.com

# Remove a provider (and all its models)
oc provider remove myprovider
```

#### 3. Model Management

Models belong to providers and are referenced using the `provider/model-id` format.

```bash
# List all models
oc list models

# Add a new model to a provider
oc model-def add minimax NewModel-v1 \
  --name "MiniMax New Model v1" \
  --context 1000000 \
  --output 8192 \
  --thinking enabled

# Remove a model from a provider
oc model-def remove minimax NewModel-v1
```

#### 4. Agent & Category Model Assignment

OpenCode and Oh-My-OpenCode organize AI model assignments through agents and categories.

**Agents** include: `build`, `oracle`, `librarian`, `explore`, `sisyphus-junior`, `plan`, etc.

**Categories** include: `visual-engineering`, `ultrabrain`, `deep`, `quick`, `writing`, etc.

```bash
# Check which model an agent is using
oc model get build

# Set model for an agent
oc model set build minimax/MiniMax-M2.1-highspeed

# Set model for a category
oc model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# Interactive model selection (recommended)
oc switch agent build
oc switch category visual-engineering

# Remove model assignment
oc model remove build

# View all agent and category assignments
oc list agents
oc list categories
```

#### 5. Backup & Restore

The backup feature saves complete snapshots of your current configuration, making it safe to experiment with changes.

```bash
# Create a backup
oc backup create

# Create a labeled backup (easier to identify)
oc backup create before-upgrade

# List all backups
oc backup list

# Restore a backup (⚠️ overwrites current config)
oc backup restore 20260411_103313_before-upgrade

# Delete a backup
oc backup delete 20260411_103313_before-upgrade
```

Backup files are stored in `~/.config/opencode/backups/`.

#### 6. Language Switching

OC Helper defaults to Chinese. You can switch languages via:

**Interactive menu:** Select "切换语言 / Switch Language" from the main menu

**Environment variable:**

```bash
# Use English interface
OC_LANG=en oc list

# Use Chinese interface (default)
oc list
```

### 🏗️ Project Structure

```
oc-helper/
├── src/
│   ├── index.ts          # CLI entry point, command definitions and routing
│   ├── interactive.ts    # Interactive menu system
│   ├── config.ts         # Configuration file read/write
│   ├── display.ts        # Terminal output formatting (tables, JSON, colors)
│   ├── i18n.ts           # Internationalization (Chinese/English)
│   ├── backup.ts         # Backup create/restore/delete
│   ├── switch.ts         # Interactive model switching
│   └── types.ts          # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

### 🛠️ Tech Stack

- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe JavaScript superset
- **[Commander.js](https://github.com/tj/commander.js)** — Node.js CLI framework
- **[Inquirer.js](https://github.com/SBoudrias/Inquirer.js)** — Interactive CLI interface
- **[Chalk](https://github.com/chalk/chalk)** — Terminal color output

### 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a Pull Request

### 📄 License

[MIT License](LICENSE)

---

<div align="center">

**Keywords / 关键词：** OpenCode, Oh-My-OpenCode, CLI tool, configuration manager, AI model management, OpenCode 配置管理, AI 模型切换, 命令行工具, 智能体模型配置, Agent model configuration, Provider management, 提供商管理, Model switching, 模型切换工具, opencode.json, oh-my-openagent.json, 备份恢复, Backup restore, Node.js CLI, TypeScript CLI, OpenCode helper, OpenCode 助手, opencode config, opencode configuration, opencode model, opencode provider, opencode agent, opencode category, AI coding assistant config, AI 编程助手配置, opencode manager, LLM model management, 大语言模型管理

</div>

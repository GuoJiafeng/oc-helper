<div align="center">

# OC Helper

**OpenCode Configuration Management CLI Tool**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/badge/npm-oc--helper--cli-red.svg)](https://www.npmjs.com/package/oc-helper-cli)

A CLI tool for managing [OpenCode](https://github.com/opencode-ai/opencode) and [Oh-My-OpenCode](https://github.com/nicepkg/oh-my-opencode) configuration files. Supports both interactive and command-line modes with Chinese/English bilingual interface.

**[中文文档](./README.md)**

</div>

---

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

#### Install via npm (Recommended)

```bash
npm install -g oc-helper-cli
```

#### Install from Source

```bash
# Clone the repository
git clone https://github.com/GuoJiafeng/oc-helper.git
cd oc-helper

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally
npm link
```

After installation, use the `oc-helper-cli` command to run OC Helper.

### 🚀 Quick Start

#### Interactive Mode (Recommended)

Simply run `oc-helper-cli` to enter the interactive menu:

```bash
oc-helper-cli
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
oc-helper-cli list

# View specific configuration types
oc-helper-cli list providers
oc-helper-cli list models
oc-helper-cli list agents
oc-helper-cli list categories

# Check which model an agent/category is using
oc-helper-cli model get build
oc-helper-cli model get visual-engineering

# Set model for an agent/category
oc-helper-cli model set build minimax/MiniMax-M2.1-highspeed
oc-helper-cli model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# Interactive model selection
oc-helper-cli switch agent build
oc-helper-cli switch category visual-engineering

# Remove an agent/category model assignment
oc-helper-cli model remove build

# View provider details
oc-helper-cli provider show minimax

# Add a new provider
oc-helper-cli provider add myprovider --base-url https://api.example.com --api-key sk-xxx

# Remove a provider
oc-helper-cli provider remove myprovider

# Add model definition to a provider
oc-helper-cli model-def add minimax MiniMax-M2.1-highspeed --name "MiniMax M2.1" --context 1000000 --output 8192

# Remove model definition from a provider
oc-helper-cli model-def remove minimax MiniMax-M2.1-highspeed

# View raw config files
oc-helper-cli config show

# Look up a config value by path
oc-helper-cli config get provider.minimax.options.baseURL

# Backup management
oc-helper-cli backup create              # Create a backup (optional label)
oc-helper-cli backup create before-test  # Create a labeled backup
oc-helper-cli backup list                # List all backups
oc-helper-cli backup restore <id>        # Restore from a backup
oc-helper-cli backup delete <id>         # Delete a backup
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
oc-helper-cli list providers

# View details of a specific provider (including all models)
oc-helper-cli provider show minimax

# Add a new provider
oc-helper-cli provider add myprovider --npm @ai-sdk/myprovider --base-url https://api.example.com

# Remove a provider (and all its models)
oc-helper-cli provider remove myprovider
```

#### 3. Model Management

Models belong to providers and are referenced using the `provider/model-id` format.

```bash
# List all models
oc-helper-cli list models

# Add a new model to a provider
oc-helper-cli model-def add minimax NewModel-v1 \
  --name "MiniMax New Model v1" \
  --context 1000000 \
  --output 8192 \
  --thinking enabled

# Remove a model from a provider
oc-helper-cli model-def remove minimax NewModel-v1
```

#### 4. Agent & Category Model Assignment

OpenCode and Oh-My-OpenCode organize AI model assignments through agents and categories.

**Agents** include: `build`, `oracle`, `librarian`, `explore`, `sisyphus-junior`, `plan`, etc.

**Categories** include: `visual-engineering`, `ultrabrain`, `deep`, `quick`, `writing`, etc.

```bash
# Check which model an agent is using
oc-helper-cli model get build

# Set model for an agent
oc-helper-cli model set build minimax/MiniMax-M2.1-highspeed

# Set model for a category
oc-helper-cli model set visual-engineering anthropic/claude-sonnet-4-20250514 --force

# Interactive model selection (recommended)
oc-helper-cli switch agent build
oc-helper-cli switch category visual-engineering

# Remove model assignment
oc-helper-cli model remove build

# View all agent and category assignments
oc-helper-cli list agents
oc-helper-cli list categories
```

#### 5. Backup & Restore

The backup feature saves complete snapshots of your current configuration, making it safe to experiment with changes.

```bash
# Create a backup
oc-helper-cli backup create

# Create a labeled backup (easier to identify)
oc-helper-cli backup create before-upgrade

# List all backups
oc-helper-cli backup list

# Restore a backup (⚠️ overwrites current config)
oc-helper-cli backup restore 20260411_103313_before-upgrade

# Delete a backup
oc-helper-cli backup delete 20260411_103313_before-upgrade
```

Backup files are stored in `~/.config/opencode/backups/`.

#### 6. Language Switching

OC Helper defaults to Chinese. You can switch languages via:

**Interactive menu:** Select "切换语言 / Switch Language" from the main menu

**Environment variable:**

```bash
# Use English interface
OC_LANG=en oc-helper-cli list

# Use Chinese interface (default)
oc-helper-cli list
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
├── README.md
└── README_EN.md
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

**Keywords:** OpenCode, Oh-My-OpenCode, CLI tool, configuration manager, AI model management, model switching, agent configuration, provider management, opencode.json, oh-my-openagent.json, backup restore, Node.js CLI, TypeScript CLI, OpenCode helper, opencode config, opencode model, opencode provider, opencode agent, opencode category, AI coding assistant config, LLM model management

</div>

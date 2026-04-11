import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { readOpenCodeConfig, writeOpenCodeConfig, readOhMyConfig, writeOhMyConfig } from "./config.js";

const BACKUP_DIR = join(homedir(), ".config", "opencode", "backups");

function ensureBackupDir(): void {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function timestampToDisplay(ts: string): string {
  const date = ts.slice(0, 8);
  const time = ts.slice(9, 15);
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
}

export interface BackupEntry {
  id: string;
  display: string;
  opencodeSize: number;
  ohmySize: number;
}

export function createBackup(label?: string): string {
  ensureBackupDir();
  const now = new Date();
  const ts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "_",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  const suffix = label ? `_${label}` : "";
  const id = `${ts}${suffix}`;

  const ocConfig = readOpenCodeConfig();
  const ohmyConfig = readOhMyConfig();

  const ocPath = join(BACKUP_DIR, `${id}.opencode.json`);
  const ohmyPath = join(BACKUP_DIR, `${id}.oh-my-openagent.json`);

  writeFileSync(ocPath, JSON.stringify(ocConfig, null, 2) + "\n", "utf-8");
  writeFileSync(ohmyPath, JSON.stringify(ohmyConfig, null, 2) + "\n", "utf-8");

  return id;
}

export function listBackups(): BackupEntry[] {
  if (!existsSync(BACKUP_DIR)) return [];

  const files = readdirSync(BACKUP_DIR);
  const ocFiles = new Set(files.filter((f) => f.endsWith(".opencode.json")));

  return files
    .filter((f) => f.endsWith(".oh-my-openagent.json"))
    .map((f) => {
      const id = f.replace(".oh-my-openagent.json", "");
      const hasOC = ocFiles.has(`${id}.opencode.json`);
      const ohmySize = statSync(join(BACKUP_DIR, f)).size;
      let ocSize = 0;
      if (hasOC) {
        ocSize = statSync(join(BACKUP_DIR, `${id}.opencode.json`)).size;
      }
      const rawTs = id.split("_").slice(0, 2).join("_");
      const label = id.includes("_") && id.split("_").length > 2
        ? id.split("_").slice(2).join("_")
        : undefined;
      const display = label
        ? `${timestampToDisplay(rawTs)} (${label})`
        : timestampToDisplay(rawTs);

      return { id, display, opencodeSize: ocSize, ohmySize };
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function restoreBackup(id: string): void {
  const ocPath = join(BACKUP_DIR, `${id}.opencode.json`);
  const ohmyPath = join(BACKUP_DIR, `${id}.oh-my-openagent.json`);

  if (!existsSync(ohmyPath)) {
    throw new Error(`Backup "${id}" not found.`);
  }

  if (existsSync(ocPath)) {
    const ocRaw = readFileSync(ocPath, "utf-8");
    const ocConfig = JSON.parse(ocRaw);
    writeOpenCodeConfig(ocConfig);
  }

  const ohmyRaw = readFileSync(ohmyPath, "utf-8");
  const ohmyConfig = JSON.parse(ohmyRaw);
  writeOhMyConfig(ohmyConfig);
}

export function deleteBackup(id: string): void {
  const ocPath = join(BACKUP_DIR, `${id}.opencode.json`);
  const ohmyPath = join(BACKUP_DIR, `${id}.oh-my-openagent.json`);

  if (!existsSync(ohmyPath)) {
    throw new Error(`Backup "${id}" not found.`);
  }

  if (existsSync(ocPath)) unlinkSync(ocPath);
  unlinkSync(ohmyPath);
}

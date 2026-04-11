import chalk from "chalk";
import type { ModelConfig, ProviderConfig } from "./types.js";

function stringifyValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function colorizeJson(json: string): string {
  return json.replace(
    /^(\s*)"([^"]+)":|"([^"\\]*(?:\\.[^"\\]*)*)"|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?/gm,
    (match, indentation: string, key: string, stringValue: string, literal: string) => {
      if (key !== undefined) {
        return `${indentation}${chalk.cyan(`"${key}"`)}:`;
      }

      if (stringValue !== undefined) {
        return chalk.green(`"${stringValue}"`);
      }

      if (literal === "true" || literal === "false" || literal === "null") {
        return chalk.green(literal);
      }

      return chalk.green(match);
    },
  );
}

export function formatContextSize(value?: number): string {
  if (value === undefined || value <= 0) {
    return "-";
  }

  const units = ["", "K", "M", "B", "T"];
  let size = value;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  const formatted = size >= 10 || Number.isInteger(size) ? Math.round(size).toString() : size.toFixed(1);
  return `${formatted}${units[index]}`;
}

export function formatModel(provider: string, modelId: string, config: ModelConfig): string {
  const displayName = config.name ?? modelId;
  const context = formatContextSize(config.limit?.context);
  const output = formatContextSize(config.limit?.output);
  const thinking = config.options?.thinking?.type ?? "-";

  return [
    chalk.bold(`${provider}/${modelId}`),
    chalk.cyan(displayName),
    `context ${chalk.green(context)}`,
    `output ${chalk.green(output)}`,
    `thinking ${chalk.green(thinking)}`,
  ].join("  ");
}

export function formatProvider(name: string, config: ProviderConfig): string {
  const providerName = config.name ?? name;
  const modelCount = Object.keys(config.models ?? {}).length;
  const baseUrl = config.options?.baseURL ?? config.api ?? "-";

  return [
    chalk.bold(providerName),
    `key ${chalk.cyan(name)}`,
    `models ${chalk.green(String(modelCount))}`,
    `base ${chalk.green(baseUrl)}`,
  ].join("  ");
}

export function formatTable(headers: string[], rows: string[][]): string {
  const allRows = [headers, ...rows];
  const widths = headers.map((_, columnIndex) => {
    return allRows.reduce((maxWidth, row) => {
      const cell = row[columnIndex] ?? "";
      return Math.max(maxWidth, cell.length);
    }, 0);
  });

  const formatRow = (row: string[], isHeader = false): string => {
    return row
      .map((cell, columnIndex) => {
        const padded = (cell ?? "").padEnd(widths[columnIndex], " ");
        return isHeader ? chalk.bold(padded) : padded;
      })
      .join("  ");
  };

  const divider = widths.map((width) => "-".repeat(width)).join("  ");
  return [formatRow(headers, true), divider, ...rows.map((row) => formatRow(row))].join("\n");
}

export function formatJSON(obj: unknown): string {
  return colorizeJson(JSON.stringify(obj, null, 2));
}

export function formatWarning(message: string): string {
  return chalk.yellow(message);
}

export function formatError(message: string): string {
  return chalk.red(message);
}

export function formatValue(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    return formatJSON(value);
  }

  return chalk.green(stringifyValue(value));
}

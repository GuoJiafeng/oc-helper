import { select } from "@inquirer/prompts";
import { getAllModels, readOhMyConfig, writeOhMyConfig } from "./config.js";
import type { SwitchTargetType, CollectedModel } from "./types.js";

export async function interactiveModelSwitch(
  targetType: SwitchTargetType,
  targetName: string,
): Promise<string> {
  const models = getAllModels();

  if (models.length === 0) {
    throw new Error("No models found in opencode.json provider configuration.");
  }

  const selectedModel = await select<string>({
    message: `Select a model for ${targetType} ${targetName}`,
    choices: models.map(({ provider, modelId, modelConfig }: CollectedModel) => ({
      name: `${provider}/${modelId}${modelConfig.name ? ` (${modelConfig.name})` : ""}`,
      value: `${provider}/${modelId}`,
    })),
    pageSize: 20,
  });

  const ohMyConfig = readOhMyConfig();

  if (targetType === "agent") {
    const current = ohMyConfig.agents?.[targetName];
    ohMyConfig.agents = {
      ...(ohMyConfig.agents ?? {}),
      [targetName]: {
        model: selectedModel,
        ...(current?.variant ? { variant: current.variant } : {}),
      },
    };
  } else {
    const current = ohMyConfig.categories?.[targetName];
    ohMyConfig.categories = {
      ...(ohMyConfig.categories ?? {}),
      [targetName]: {
        model: selectedModel,
        ...(current?.variant ? { variant: current.variant } : {}),
      },
    };
  }

  writeOhMyConfig(ohMyConfig);
  return selectedModel;
}

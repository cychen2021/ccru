import { invoke } from '@tauri-apps/api/core';
import { AIServiceConfig } from './aiServiceConfig';
import { appConfigDir, join } from '@tauri-apps/api/path';

export interface Config {
  'ai-service': AIServiceConfig;
}

async function configPaths(): Promise<string[]> {
  const configDir = await appConfigDir();
  
  return [
    await join(configDir, 'config.toml'),
  ];
}

function convertConfigJson(config_json: any): Config {
  return {
    'ai-service': {
      provider: config_json['ai-service'].provider,
      ollama: config_json['ai-service'].ollama,
      azure: config_json['ai-service'].azure,
      deepseek: config_json['ai-service'].deepseek,
      azureDeepSeek: config_json['ai-service']['azure-deepseek'],
    }
  }
}


export async function loadConfig(): Promise<Config> {
  const candidateConfigPaths = await configPaths();
  for (let i = 0; i < candidateConfigPaths.length; i++) {
    const configPath = candidateConfigPaths[i];
    const useDefaultWhenMissing = i === candidateConfigPaths.length - 1;
    const load_config_response = await invoke('load_config', { configPath: configPath, useDefaultWhenMissing }) as {
      config: any;
      usingDefault: boolean;
    };
    if (load_config_response) {
      if (load_config_response.usingDefault) {
        console.log('Using default config');
        invoke('save_config', { config: load_config_response.config, configPath: candidateConfigPaths[0] });
      }

      return convertConfigJson(load_config_response.config);
    }
  }

  throw new Error('Should not happen');
}

export function canonicalizeProvider(provider: AIServiceConfig['provider']): 'ollama' | 'azure' | 'deepseek' | 'azureDeepSeek' {
  switch (provider) {
    case 'ollama':
      return 'ollama';
    case 'azure':
      return 'azure';
    case 'deepseek':
      return 'deepseek';
    case 'azure-deepseek':
      return 'azureDeepSeek';
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}



export async function saveConfig(config: Config): Promise<void> {
  const candidateConfigPaths = await configPaths();
  if (candidateConfigPaths.length === 0) {
    throw new Error('Should not happen');
  }
  const configPath = candidateConfigPaths[0];
  console.log(`${JSON.stringify(config)}`);
  await invoke('save_config', { config: config, configPath: configPath });
}

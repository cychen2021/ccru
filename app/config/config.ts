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

export async function loadConfig(): Promise<Config> {
  const candidateConfigPaths = await configPaths();
  for (let i = 0; i < candidateConfigPaths.length; i++) {
    const configPath = candidateConfigPaths[i];
    const useDefaultWhenMissing = i === candidateConfigPaths.length - 1;
    const config = await invoke('load_config', { configPath: configPath, useDefaultWhenMissing }) as Config;
    if (config) {
      return config;
    }
  }
  throw new Error('Should not happen');
}

export async function saveConfig(config: Config): Promise<void> {
  const candidateConfigPaths = await configPaths();
  if (candidateConfigPaths.length === 0) {
    throw new Error('Should not happen');
  }
  const configPath = candidateConfigPaths[0];
  await invoke('save_config', { config: config, configPath: configPath });
}

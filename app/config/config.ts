import { invoke } from '@tauri-apps/api/core';
import { AIServiceConfig } from './aiServiceConfig';

export interface Config {
  'ai-service': AIServiceConfig;
}

// Note: configPath is relative to `tauri-src`
export async function loadConfig(configPath: string = '../public/default-config.toml'): Promise<Config> {
  const config = await invoke('load_config', { configPath: configPath }) as Config;
  return config;
}

export async function saveConfig(config: Config, configPath: string = './config.toml'): Promise<void> {
  await invoke('save_config', { config: config, configPath: configPath });
}

import { invoke } from '@tauri-apps/api/core';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export interface AzureConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface DeepSeekConfig {
  apiKey: string;
  model: string;
}

export type AIServiceConfig = {
  provider: 'ollama';
  providerConfig: OllamaConfig;
} | {
  provider: 'azure';
  providerConfig: AzureConfig;
} | {
  provider: 'deepseek';
  providerConfig: DeepSeekConfig;
}

export interface Config {
  'ai-service': AIServiceConfig;
}

// NOTE: `configPath` is relative to `tauri-src`.
export async function loadConfig(configPath: string = '../public/default-config.toml'): Promise<Config> {
  const config = await invoke('load_config', { configPath: configPath }) as Config;
  return config;
} 
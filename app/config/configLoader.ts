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

interface Config {
  'ai-service': {
    provider: 'ollama' | 'azure' | 'deepseek'
    ollama?: OllamaConfig;
    azure?: AzureConfig;
    deepseek?: DeepSeekConfig;
  };
}

// Note: configPath is relative to `tauri-src`
export async function loadConfig(configPath: string = '../public/default-config.toml'): Promise<AIServiceConfig> {
  const config = await invoke('get_config', { configPath: configPath }) as AIServiceConfig;
  return config;
} 
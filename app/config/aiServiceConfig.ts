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

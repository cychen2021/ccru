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
  provider: 'ollama' | 'azure' | 'deepseek';
  ollama?: OllamaConfig;
  azure?: AzureConfig;
  deepseek?: DeepSeekConfig;
}

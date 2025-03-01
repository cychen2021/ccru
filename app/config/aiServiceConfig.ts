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

export interface AzureDeepSeekConfig {
  apiKey: string;
  baseUrl: string;
}

export type AIServiceConfig = {
  provider: 'ollama' | 'azure' | 'deepseek' | 'azure-deepseek';

  ollama?: OllamaConfig;
  azure?: AzureConfig;
  deepseek?: DeepSeekConfig;
  azureDeepSeek?: AzureDeepSeekConfig;
}

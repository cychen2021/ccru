import { AIService } from './AIService';
import { OllamaService } from './ollamaService';
import { AzureAIService } from './azureAIService';
import { DeepSeekService } from './deepSeekService';
import { AIServiceConfig } from '../config/aiServiceConfig';

export class AIServiceFactory {
  static createService(config: AIServiceConfig): AIService {
    switch (config.provider) {
      case 'ollama':
        return new OllamaService(config.providerConfig);
      
      case 'azure':
        return new AzureAIService(config.providerConfig);
        
      case 'deepseek':
        return new DeepSeekService(config.providerConfig);
    }
  }
} 
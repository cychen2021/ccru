import { AIService } from './AIService';

interface AzureAIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class AzureAIService implements AIService {
  constructor(private config: AzureAIConfig) {}

  async askQuestion(_question: string, _context?: string): Promise<string> {
    throw new Error('Method not implemented.'); 
  }
}

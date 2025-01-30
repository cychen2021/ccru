import { AIService } from './AIService';

interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export class OllamaService implements AIService {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async askQuestion(question: string, context?: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: context 
            ? `Context: ${context}\n\nQuestion: ${question}`
            : question,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`API error: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('Invalid response format from Ollama API');
      }

      return data.response;
    } catch (error) {
      console.error('Error in askQuestion:', error);
      throw error;
    }
  }
} 
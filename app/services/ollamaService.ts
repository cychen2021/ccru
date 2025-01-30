import { Message } from "../types/chat";
interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export class OllamaService {
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

  async chat(messages: Message[], pdfContent?: string) {
    const systemMessage = pdfContent 
      ? `You are an assistant that can help analyze the following document:\n\n${pdfContent}\n\nPlease answer user questions based on this content.`
      : 'You are a friendly assistant that can help answer various user questions.';

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemMessage },
          ...messages
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama');
    }

    const data = await response.json();
    return data.response;
  }
} 
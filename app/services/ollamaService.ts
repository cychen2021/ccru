interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export class OllamaService {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async askQuestion(context: string, question: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: `Context: ${context}\n\nQuestion: ${question}`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Ollama');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  }
} 
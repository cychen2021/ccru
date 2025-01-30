export interface AIService {
  askQuestion(question: string, context?: string): Promise<string>;
} 
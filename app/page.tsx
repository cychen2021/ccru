'use client';

import { ResearchAssistant } from './components/ResearchAssistant';
import { OllamaService } from './services/ollamaService';
import { ollamaConfig } from './config/ollama';

const ollamaService = new OllamaService(ollamaConfig);

export default function Home() {
  const handleQuestion = async (question: string, pdfContent?: string) => {
    try {
      return await ollamaService.askQuestion(question, "The following is the content of the PDF: " + pdfContent);
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, there was an error processing your question.';
    }
  };

  return (
    <main>
      <ResearchAssistant onAskQuestion={handleQuestion} />
    </main>
  );
} 
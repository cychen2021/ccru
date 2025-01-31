'use client';

import Link from 'next/link';
import { ResearchAssistant } from './components/ResearchAssistant';
import { AIService } from './services/AIService';
import { useState } from 'react';

export default function Home() {
  const [aiService, _setAIService] = useState<AIService | null>(null);
  const [error, _setError] = useState<string | null>(null);

  const handleQuestion = async (question: string, pdfContent?: string) => {
    if (!aiService) {
      return 'AI service not initialized';
    }

    try {
      return await aiService.askQuestion(
        question, 
        pdfContent ? `The following is the content of the PDF: ${pdfContent}` : undefined
      );
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, there was an error processing your question.';
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI Research Assistant</h1>
        <Link 
          href="/settings"
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Settings
        </Link>
      </div>
      
      {aiService ? (
        <ResearchAssistant onAskQuestion={handleQuestion} />
      ) : (
        <div>Loading AI service...</div>
      )}
    </main>
  );
} 
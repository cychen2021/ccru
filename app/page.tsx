'use client';

import { ResearchAssistant } from './components/ResearchAssistant';
import { AIService } from './services/AIService';
import { loadConfig, Config } from './config/configLoader';
import { AIServiceFactory } from './services/AIServiceFactory';
import { useEffect, useState } from 'react';

export default function Home() {
  const [aiService, setAIService] = useState<AIService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const loadedConfig = await loadConfig();
        setConfig(loadedConfig);
        const service = AIServiceFactory.createService(loadedConfig['ai-service']);
        setAIService(service);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize AI service');
        console.error('Failed to initialize AI service:', err);
      }
    }
    init();
  }, []);

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
    <main>
      {config && (
        <pre className="p-4 bg-gray-100 mb-4 overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      )}
      {aiService ? (
        <ResearchAssistant onAskQuestion={handleQuestion} />
      ) : (
        <div>Loading AI service...</div>
      )}
    </main>
  );
} 
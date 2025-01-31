'use client';

import { ResearchAssistant } from './components/ResearchAssistant';
import { AIService } from './services/AIService';
import { loadConfig, Config } from './config/config';
import { AIServiceFactory } from './services/AIServiceFactory';
import { useEffect, useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { invoke } from '@tauri-apps/api/core';

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

  const handleSaveConfig = async (newConfig: Config) => {
    try {
      await invoke('save_config', { 
        config: newConfig,
        configPath: '../public/default-config.toml'
      });
      setConfig(newConfig);
      const service = AIServiceFactory.createService(newConfig['ai-service']);
      setAIService(service);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      console.error('Failed to save configuration:', err);
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <main className="p-4">
      {config && (
        <ConfigPanel 
          config={config} 
          onSave={handleSaveConfig}
        />
      )}
      {aiService ? (
        <ResearchAssistant onAskQuestion={handleQuestion} />
      ) : (
        <div>Loading AI service...</div>
      )}
    </main>
  );
} 
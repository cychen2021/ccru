'use client';

import Link from 'next/link';
import { ResearchAssistant } from './components/ResearchAssistant';
import { aiService } from './services/AIService';
import { useState, useEffect } from 'react';
import { loadConfig } from './config/config';
import "./index.css";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await loadConfig();
        const newSessionId = await aiService.createSession();
        setSessionId(newSessionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        console.error('Failed to initialize:', err);
      }
    }
    init();
  }, []);

  const handleQuestion = async (question: string) => {
    if (!sessionId) {
      return 'Session not initialized';
    }

    return await aiService.askQuestion(sessionId, question);
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <Link 
          href="/settings"
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 w-[100px]"
        >
          Settings
        </Link>
      </div>
      
      {sessionId ? (
        <ResearchAssistant onAskQuestion={handleQuestion} />
      ) : (
        <div>Initializing session...</div>
      )}
    </main>
  );
} 
'use client';

import { useState } from 'react';
import { LoadingDots } from './ui/loading-dots';

interface ResearchAssistantProps {
  onAskQuestion: (question: string) => Promise<string>;
}

export function ResearchAssistant({ onAskQuestion }: ResearchAssistantProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = {
      role: 'user',
      content: question,
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      setIsLoading(true);
      const response = await onAskQuestion(question);
      
      if (!response) {
        throw new Error('No response received from the assistant');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}`
        : 'An error occurred while processing your request: ' + JSON.stringify(error);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="h-[60vh] overflow-y-auto border rounded p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`p-2 rounded ${
              message.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 mr-8 p-2 rounded">
            <LoadingDots />
          </div>
        )}
      </div>

      <form onSubmit={handleQuestionSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="w-[100px] px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
} 
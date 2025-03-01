'use client';

import React, { useState } from 'react';
import { LoadingDots } from './ui/loading-dots';
import Markdown from 'react-markdown';

interface ResearchAssistantProps {
  onAskQuestion: (question: string) => Promise<string>;
}

function FormattedMessage({ children }: { children: string[] }) {
  if (children.length === 0) {
    return <></>
  }
  const elements: React.ReactNode[] = []
  for (const [idx, child] of children.entries()) {
    const pattern = /\<think\>(?<think>(?:.|\n)*?)\<\/think\>(?<answer>(?:.|\n)*)/mg;
    const match = pattern.exec(child);
    if (match) {
      const think = match.groups?.think;
      const answer = match.groups?.answer;
      elements.push(<React.Fragment key={idx}>
        <div className="bg-gray-100 p-2 rounded border-l-4 border-gray-300">
          <div className="font-medium">Thinking...</div>
          <Markdown>{think}</Markdown>
        </div>
        <Markdown>{answer}</Markdown>
      </React.Fragment>)
    } else {
      elements.push(<Markdown key={idx}>{child}</Markdown>)
    }
  }
  return <>{elements}</>
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
    <div className="space-y-4 max-w-[80%] mx-auto">
      <div className="h-[60vh] overflow-y-auto border rounded p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`p-2 rounded ${
              message.role === 'user' ? 'bg-blue-100 ml-[55%]' : 'bg-gray-100 mr-[55%]'
            }`}
          >
            <FormattedMessage> {message.content} </FormattedMessage>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-2 rounded mr-[55%]">
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
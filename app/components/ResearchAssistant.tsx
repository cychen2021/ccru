import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { Message } from '../types/chat';
import { LoadingDots } from './ui/loading-dots';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ResearchAssistantProps {
  onAskQuestion: (question: string) => Promise<string>;
}

export function ResearchAssistant({ onAskQuestion }: ResearchAssistantProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newMessage = {
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, newMessage]);
    setQuestion('');

    try {
      setIsLoading(true);
      const response = await onAskQuestion(question);
      
      if (!response) {
        throw new Error('No response received from the assistant');
      }

      setResponse(response);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error details:', {
        error,
        question,
        hasPdfContent: !!pdfContent,
        errorType: error instanceof Error ? error.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}`
        : 'An error occurred while processing your request.';

      setResponse(errorMessage);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: errorMessage,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
        {/* PDF Viewer Section */}
        <div className="w-1/2 p-4 border-r">
          {pdfFile ? (
            <Document
              file={pdfFile}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              <Page pageNumber={pageNumber} />
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="p-4"
              />
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="w-1/2 flex flex-col p-4">
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">
                {pdfContent ? 'PDF uploaded. Start the conversation' : 'Start a conversation'}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  {message.content}
                </div>
              ))
            )}
            {isLoading && <LoadingDots />}
          </div>

          <form onSubmit={handleQuestionSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 p-2 border rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
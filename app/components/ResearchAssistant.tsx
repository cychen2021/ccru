import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ResearchAssistantProps {
  onAskQuestion: (question: string) => Promise<string>;
}

export const ResearchAssistant: React.FC<ResearchAssistantProps> = ({ onAskQuestion }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const handleQuestionSubmit = async () => {
    if (question.trim()) {
      const answer = await onAskQuestion(question);
      setResponse(answer);
    }
  };

  return (
    <div className="flex h-screen">
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
      
      <div className="w-1/2 p-4 flex flex-col">
        <div className="flex-grow overflow-auto mb-4">
          {response && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              {response}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the paper..."
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleQuestionSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}; 
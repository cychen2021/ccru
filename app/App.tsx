import React from 'react';
import { ResearchAssistant } from './components/ResearchAssistant';
import { OllamaService } from './services/ollamaService';
import { ollamaConfig } from './config/ollama';

const ollamaService = new OllamaService(ollamaConfig);

function App() {
  const handleQuestion = async (question: string) => {
    try {
      return await ollamaService.askQuestion('', question);
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, there was an error processing your question.';
    }
  };

  return (
    <div className="App">
      <ResearchAssistant onAskQuestion={handleQuestion} />
    </div>
  );
}

export default App; 
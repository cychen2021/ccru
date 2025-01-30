export const ollamaConfig = {
  baseUrl: process.env.REACT_APP_OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.REACT_APP_OLLAMA_MODEL || 'llama2',
}; 
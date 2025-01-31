'use client';

import { Config } from '../config/config';
import { AIServiceConfig } from '../config/aiServiceConfig';

interface ConfigContentsProps {
  config: Config;
  onProviderChange: (provider: AIServiceConfig['provider']) => void;
}

export function ConfigContents({ config, onProviderChange }: ConfigContentsProps) {
  const aiServiceConfig = config['ai-service'];
  const providerConfig = (() => {switch (aiServiceConfig.provider) {
    case 'ollama':
      return aiServiceConfig.ollama;
    case 'azure':
      return aiServiceConfig.azure;
    case 'deepseek':
      return aiServiceConfig.deepseek;
  }})();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Provider:</h3>
        <select 
          value={aiServiceConfig.provider}
          onChange={(e) => onProviderChange(e.target.value as AIServiceConfig['provider'])}
          className="p-2 border rounded"
          aria-label="AI Service Provider"
        >
          <option value="ollama">Ollama</option>
          <option value="azure">Azure</option>
          <option value="deepseek">DeepSeek</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {providerConfig && Object.entries(providerConfig).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm text-gray-500 capitalize">{key}</span>
            <span className={`font-mono ${key.includes('key') ? 'text-gray-500' : ''}`}>
              {key.includes('key') ? '••••••••' : value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 
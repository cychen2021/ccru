'use client';

import { useState } from 'react';
import { Config } from '../config/config';
import { AIServiceConfig } from '../config/aiServiceConfig';
import { ConfigContents } from './ConfigContents';

interface ConfigPanelProps {
  config: Config;
  onSave: (config: Config) => Promise<void>;
}

export function ConfigPanel({ config, onSave }: ConfigPanelProps) {
  const [currentConfig, setCurrentConfig] = useState<Config>(config);
  const [isEditing, setIsEditing] = useState(false);

  const handleProviderChange = (provider: AIServiceConfig['provider']) => {
    const defaultConfigs: Record<AIServiceConfig['provider'], any> = {
      ollama: { baseUrl: 'http://localhost:11434', model: 'llama2' },
      azure: { baseUrl: '', apiKey: '', model: 'gpt-4' },
      deepseek: { apiKey: '', model: 'deepseek-chat' }
    };

    setCurrentConfig({
      'ai-service': {
        provider,
        providerConfig: defaultConfigs[provider]!
      }
    });
  };

  const handleConfigChange = (key: string, value: string) => {
    setCurrentConfig((prev) => ({
      'ai-service': {
        ...prev['ai-service'],
        providerConfig: {
          ...prev['ai-service'].providerConfig,
          [key]: value
        }
      }
    } as Config));
  };

  const renderProviderConfig = () => {
    const { provider, providerConfig } = currentConfig['ai-service'];

    switch (provider) {
      case 'ollama':
        return (
          <>
            <input
              type="text"
              value={providerConfig?.baseUrl || ''}
              onChange={e => handleConfigChange('baseUrl', e.target.value)}
              placeholder="Base URL"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={providerConfig?.model || ''}
              onChange={e => handleConfigChange('model', e.target.value)}
              placeholder="Model"
              className="p-2 border rounded"
            />
          </>
        );

      case 'azure':
        return (
          <>
            <input
              type="text"
              value={providerConfig?.baseUrl || ''}
              onChange={e => handleConfigChange('baseUrl', e.target.value)}
              placeholder="Base URL"
              className="p-2 border rounded"
            />
            <input
              type="password"
              value={providerConfig?.apiKey || ''}
              onChange={e => handleConfigChange('apiKey', e.target.value)}
              placeholder="API Key"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={providerConfig?.model || ''}
              onChange={e => handleConfigChange('model', e.target.value)}
              placeholder="Model"
              className="p-2 border rounded"
            />
          </>
        );

      case 'deepseek':
        return (
          <>
            <input
              type="password"
              value={providerConfig?.apiKey || ''}
              onChange={e => handleConfigChange('apiKey', e.target.value)}
              placeholder="API Key"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={providerConfig?.model || ''}
              onChange={e => handleConfigChange('model', e.target.value)}
              placeholder="Model"
              className="p-2 border rounded"
            />
          </>
        );
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">AI Service Configuration</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <select
            aria-label="AI Service Provider"
            value={currentConfig['ai-service']?.provider || ''}
            onChange={e => handleProviderChange(e.target.value as AIServiceConfig['provider'])}
            className="w-full p-2 border rounded"
          >
            <option value="ollama">Ollama</option>
            <option value="azure">Azure</option>
            <option value="deepseek">DeepSeek</option>
          </select>

          <div className="space-y-2">
            {renderProviderConfig()}
          </div>

          <button
            onClick={async () => {
              await onSave(currentConfig);
              setIsEditing(false);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <ConfigContents 
          config={currentConfig} 
          onProviderChange={handleProviderChange}
        />
      )}
    </div>
  );
} 
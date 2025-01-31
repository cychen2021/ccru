'use client';

import { useState } from 'react';
import { Config } from '../config/config';
import { AIServiceConfig } from '../config/aiServiceConfig';
import { ConfigContents } from './ConfigContents';

interface ConfigPanelProps {
  initConfig: Config;
  onSave: (config: Config) => Promise<void>;
}

export function ConfigPanel({ initConfig, onSave }: ConfigPanelProps) {
  const [currentConfig, setCurrentConfig] = useState<Config>(structuredClone(initConfig));
  const [isEditing, setIsEditing] = useState(false);

  const handleProviderChange = (provider: AIServiceConfig['provider']) => {
    const defaultValues = {
      ollama: { baseUrl: 'http://localhost:11434', model: 'llama2' },
      azure: { baseUrl: '', apiKey: '', model: 'gpt-4' },
      deepseek: { apiKey: '', model: 'deepseek-chat' }
    };
    setCurrentConfig(prev => ({
      'ai-service': {
        provider,
        ollama: prev['ai-service'].ollama || defaultValues.ollama,
        azure: prev['ai-service'].azure || defaultValues.azure,
        deepseek: prev['ai-service'].deepseek || defaultValues.deepseek,
      } as AIServiceConfig,
    }));
  };

  const handleConfigChange = (key: string, value: string) => {
    setCurrentConfig((prev) => {
      const newAIServiceConfig = structuredClone(prev['ai-service']);
      const provider = newAIServiceConfig.provider;
      switch (provider) {
        case 'ollama':
          newAIServiceConfig.ollama = {
            ...newAIServiceConfig.ollama!,
            [key]: value
          };
          break;
        case 'azure':
          newAIServiceConfig.azure = {
            ...newAIServiceConfig.azure!,
            [key]: value
          };
          break;
        case 'deepseek':
          newAIServiceConfig.deepseek = {
            ...newAIServiceConfig.deepseek!,
            [key]: value
          };
          break;
      }
      return {
        'ai-service': newAIServiceConfig,
      } as Config;
    });
  };

  const renderProviderConfig = () => {
    const { provider, ollama, azure, deepseek } = currentConfig['ai-service'];

    switch (provider) {
      case 'ollama':
        return (
          <>
            <input
              type="text"
              defaultValue={ollama?.baseUrl || ''}
              onChange={e => handleConfigChange('baseUrl', e.target.value)}
              placeholder="Base URL"
              className="p-2 border rounded"
            />
            <input
              type="text"
              defaultValue={ollama?.model || ''}
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
              defaultValue={azure?.baseUrl || ''}
              onChange={e => handleConfigChange('baseUrl', e.target.value)}
              placeholder="Base URL"
              className="p-2 border rounded"
            />
            <input
              type="password"
              defaultValue={azure?.apiKey || ''}
              onChange={e => handleConfigChange('apiKey', e.target.value)}
              placeholder="API Key"
              className="p-2 border rounded"
            />
            <input
              type="text"
              defaultValue={azure?.model || ''}
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
              defaultValue={deepseek?.apiKey || ''}
              onChange={e => handleConfigChange('apiKey', e.target.value)}
              placeholder="API Key"
              className="p-2 border rounded"
            />
            <input
              type="text"
              defaultValue={deepseek?.model || ''}
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
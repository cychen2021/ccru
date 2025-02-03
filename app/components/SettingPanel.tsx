'use client';

import { useState } from 'react';
import { Config } from '../config/config';
import { AIServiceConfig } from '../config/aiServiceConfig';

interface SettingPanelProps {
  initConfig: Config;
  onSave: (config: Config) => Promise<void>;
}

type TabId = 'general' | AIServiceConfig['provider'];

function SettingItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-grow justify-between gap-6 items-center w-full">
      <label className="text-sm font-medium text-gray-700 w-[200px]">
        {label}
      </label>
      <span className="w-[400px]">
        {children}
      </span>
    </div>
  );
}

export function SettingPanel({ initConfig, onSave }: SettingPanelProps) {
  const [config, setConfig] = useState<Config>(initConfig);
  const [selectedTab, setSelectedTab] = useState<TabId>('general');

  const handleProviderSelect = (provider: AIServiceConfig['provider']) => {
    setConfig(prev => ({
      'ai-service': {
        ...prev['ai-service'],
        provider
      }
    }));
  };

  const handleConfigChange = (provider: AIServiceConfig['provider'], key: string, value: string) => {
    setConfig(prev => ({
      'ai-service': {
        ...prev['ai-service'],
        [provider]: {
          ...prev['ai-service'][provider],
          [key]: value
        }
      }
    }));
  };

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'general', label: 'General' },
    { id: 'ollama', label: 'Ollama' },
    { id: 'azure', label: 'Azure' },
    { id: 'deepseek', label: 'DeepSeek' },
  ];

  const renderTabContent = () => {
    if (selectedTab === 'general') {
      return (
        <div className="flex flex-col gap-6">
          <SettingItem label="Active Provider">
            <select
              value={config['ai-service'].provider}
              onChange={(e) => handleProviderSelect(e.target.value as AIServiceConfig['provider'])}
              className="w-full p-2 border rounded"
              title="provider"
            >
              <option value="ollama">Ollama</option>
              <option value="azure">Azure</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </SettingItem>
        </div>
      );
    }

    switch (selectedTab) {
      case 'ollama':
        return (
          <div className="flex flex-col gap-6 w-full">
            <SettingItem label="Base URL">
              <input
                type="text"
                value={config['ai-service'].ollama?.baseUrl || ''}
                onChange={e => handleConfigChange('ollama', 'baseUrl', e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full p-2 border rounded width-[10px]"
              />
            </SettingItem>
            <SettingItem label="Model">
              <input
                type="text"
                value={config['ai-service'].ollama?.model || ''}
                onChange={e => handleConfigChange('ollama', 'model', e.target.value)}
                placeholder="llama2"
                className="w-full p-2 border rounded"
              />
            </SettingItem>
          </div>
        );
      case 'azure':
        return (
          <div className="flex flex-col gap-6">
            <SettingItem label="Base URL">
              <input
                type="text"
                value={config['ai-service'].azure?.baseUrl || ''}
                onChange={e => handleConfigChange('azure', 'baseUrl', e.target.value)}
                placeholder="https://your-resource.openai.azure.com"
                className="w-full p-2 border rounded"
              />
            </SettingItem>
            <SettingItem label="API Key">
              <input
                type="password"
                value={config['ai-service'].azure?.apiKey || ''}
                onChange={e => handleConfigChange('azure', 'apiKey', e.target.value)}
                placeholder="Enter your API key"
                className="w-full p-2 border rounded"
              />
            </SettingItem>
            <SettingItem label="Model">
              <input
                type="text"
                value={config['ai-service'].azure?.model || ''}
                onChange={e => handleConfigChange('azure', 'model', e.target.value)}
                placeholder="gpt-4"
                className="w-full p-2 border rounded"
              />
            </SettingItem>
          </div>
        );
      case 'deepseek':
        return (
          <div className="flex flex-col gap-6">
            <SettingItem label="API Key">
              <input
                type="password"
                value={config['ai-service'].deepseek?.apiKey || ''}
                onChange={e => handleConfigChange('deepseek', 'apiKey', e.target.value)}
                placeholder="Enter your API key"
                className="w-full p-2 border rounded"
              />
            </SettingItem>
            <SettingItem label="Model">
              <input
                type="text"
                value={config['ai-service'].deepseek?.model || ''}
                onChange={e => handleConfigChange('deepseek', 'model', e.target.value)}
                placeholder="deepseek-chat"
                className="w-full p-2 border rounded"
              />
            </SettingItem>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 min-w-[600px]">
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-4 border-b-2 -mb-px ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.id !== 'general' && config['ai-service'].provider === tab.id && 
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Active
                </span>
              }
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border rounded w-full">
        {renderTabContent()}
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.history.back()}
          className="w-[120px] px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(config)}
          className="w-[120px] px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Config, loadConfig, saveConfig } from '../config/config';
import { SettingPanel } from '../components/SettingPanel';

export default function Settings() {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const loadedConfig = await loadConfig();
        setConfig(loadedConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        console.error('Failed to load configuration:', err);
      }
    }
    init();
  }, []);

  const handleSaveConfig = async (newConfig: Config) => {
    try {
      saveConfig(newConfig);
      setConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      console.error('Failed to save configuration:', err);
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <main className="p-4 min-w-[600px]">
      <div className="flex items-center mb-6 min-w-[600px]">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      {config ? (
        <SettingPanel 
          initConfig={config} 
          onSave={handleSaveConfig}
        />
      ) : (
        <div>Loading configuration...</div>
      )}
    </main>
  );
} 
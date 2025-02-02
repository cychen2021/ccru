import { invoke } from '@tauri-apps/api/core';

export const aiService ={
  createSession: async (): Promise<string> => {
    // TODO
    const response = await invoke('create_session') as {
      sessionId: string;
    } | {
      error: unknown;
    }
  }
}

import { invoke } from '@tauri-apps/api/core';

export const aiService ={
  createSession: async (): Promise<string> => {
    const response = await invoke('create_session') as string | {
      error: unknown;
    }

    if (typeof response !== 'string') {
      throw new Error('Failed to create session ' + JSON.stringify(response.error));
    }

    return response;
  },
  askQuestion: async (sessionId: string, question: string): Promise<string> => {
    const response = await invoke('ask_question', { sessionId, question }) as string | {
      error: unknown;
    }

    if (typeof response !== 'string') {
      throw new Error('Failed to ask question ' + JSON.stringify(response.error));
    }

    return response;
  }
}

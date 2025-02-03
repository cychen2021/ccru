import { invoke } from '@tauri-apps/api/core';

export const aiService ={
  createSession: async (): Promise<string> => {
    const response = await invoke('create_session') as {
      sessionId: string;
    } | {
      error: unknown;
    }

    if ('error' in response) {
      throw new Error('Failed to create session ' + JSON.stringify(response.error));
    }

    return response.sessionId;
  },
  askQuestion: async (sessionId: string, question: string): Promise<string> => {
    const response = await invoke('ask_question', { sessionId, question }) as {
      answer: string;
    } | {
      error: unknown;
    }

    if ('error' in response) {
      throw new Error('Failed to ask question ' + JSON.stringify(response.error));
    }

    return response.answer;
  }
}

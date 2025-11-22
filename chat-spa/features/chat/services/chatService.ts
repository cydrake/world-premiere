import { Message } from '../types';

export interface IChatService {
  sendMessage(content: string): Promise<Message>;
}

export class MockChatService implements IChatService {
  async sendMessage(content: string): Promise<Message> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I received your message: "${content}". This is a simulated response.`,
          timestamp: new Date(),
        });
      }, 1000);
    });
  }
}

export const chatService = new MockChatService();

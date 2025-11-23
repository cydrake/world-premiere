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

/**
 * RealChatService
 * Calls the backend `/api/v1/chat` endpoint to get an assistant response.
 * Uses `NEXT_PUBLIC_API_URL` if provided, otherwise will call a relative path.
 */
export class RealChatService implements IChatService {
  private baseUrl: string;

  constructor() {
    // NEXT_PUBLIC_API_URL should not have a trailing slash
    const env = process.env.NEXT_PUBLIC_API_URL || '';
    this.baseUrl = env.replace(/\/$/, '');
  }

  async sendMessage(content: string): Promise<Message> {
    const urlBase = this.baseUrl || '';
    const url = `${urlBase}/api/v1/chat?question=${encodeURIComponent(content)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Chat API responded with ${res.status}`);
    }

    // Try to parse JSON and normalize to Message shape
    const data = await res.json().catch(() => null);

    // Backend may return different shapes. Try common possibilities.
    if (!data) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
    }

    // If backend returns { content: '...' }
    if (typeof data === 'object' && 'content' in data) {
      return {
        id: data.id ? String(data.id) : (Date.now() + 1).toString(),
        role: data.role || 'assistant',
        content: String((data as any).content || ''),
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      };
    }

    // If backend returns plain string
    if (typeof data === 'string') {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data,
        timestamp: new Date(),
      };
    }

    // If backend returns array of chunks/scenes, join their text
    if (Array.isArray(data)) {
      const joined = data.map((d: any) => d.content || d.text || '').join('\n');
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: joined,
        timestamp: new Date(),
      };
    }

    // Fallback
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: String(data),
      timestamp: new Date(),
    };
  }
}

// Export a suitable chatService implementation. Use mock when NEXT_PUBLIC_USE_MOCK === 'true'
const useMock = (process.env.NEXT_PUBLIC_USE_MOCK || '').toLowerCase() === 'true';
export const chatService: IChatService = useMock ? new MockChatService() : new RealChatService();

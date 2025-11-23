import { Message } from '../types';

export interface IChatService {
  sendMessage(content: string): Promise<Message>;
  sendMessageStream(content: string): AsyncGenerator<string, Message, unknown>;
}

export class RealChatService implements IChatService {
  private baseUrl: string;

  constructor() {
    const env = process.env.NEXT_PUBLIC_API_URL || '';
    this.baseUrl = env.replace(/\/$/, '');
  }

  private async parseJsonResponse(res: Response): Promise<Message> {
    const data = await res.json().catch(() => null);
    console.log('API Response (JSON):', data);

    if (!data) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      return {
        id: data.id ? String(data.id) : (Date.now() + 1).toString(),
        role: data.role || 'assistant',
        content: String((data as any).content || ''),
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      };
    }

    if (typeof data === 'string') {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data,
        timestamp: new Date(),
      };
    }

    if (Array.isArray(data)) {
      const joined = data.map((d: any) => d.content || d.text || '').join('\n');
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: joined,
        timestamp: new Date(),
      };
    }

    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: String(data),
      timestamp: new Date(),
    };
  }

  private async parseSSEResponse(res: Response): Promise<Message> {
    if (!res.body) {
      const text = await res.text().catch(() => '');
      console.log('API Response (SSE fallback):', text);
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let assembled = '';
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = !!streamDone;
      if (value) buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const event = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        const matches = Array.from(event.matchAll(/^data:\s?(.*)$/gm)).map((m) => m[1]);
        if (matches.length === 0) continue;
        const data = matches.join('\n');
        if (data.trim() === '[DONE]') {
          return {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: assembled,
            timestamp: new Date(),
          };
        }
        assembled += data;
      }
    }

    if (buffer) {
      const matches = Array.from(buffer.matchAll(/^data:\s?(.*)$/gm)).map((m) => m[1]);
      if (matches.length > 0) assembled += matches.join('\n');
    }

    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: assembled,
      timestamp: new Date(),
    };
  }

  async sendMessage(content: string): Promise<Message> {
    const urlBase = this.baseUrl || '';
    const url = `${urlBase}/api/v1/chat?question=${encodeURIComponent(content)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
      },
    });

    if (!res.ok) throw new Error(`Chat API responded with ${res.status}`);

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return this.parseJsonResponse(res);
    if (contentType.includes('text/event-stream') || contentType.includes('event-stream')) return this.parseSSEResponse(res);

    const text = await res.text().catch(() => '');
    console.log('API Response (fallback):', text);
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    };
  }

  async* sendMessageStream(content: string): AsyncGenerator<string, Message, unknown> {
    const urlBase = this.baseUrl || '';
    const url = `${urlBase}/api/v1/chat?question=${encodeURIComponent(content)}`;
    console.log('Starting streaming request to:', url);

    let res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
      },
    });

    if (!res.ok) throw new Error(`Chat API responded with ${res.status}`);

    const contentType = res.headers.get('content-type') || '';
    console.log('Response content-type:', contentType);

    if (res.body) {
      const [logStream, processStream] = res.body.tee();
      const logReader = logStream.getReader();
      const logDecoder = new TextDecoder('utf-8');
      let rawContent = '';
      
      (async () => {
        try {
          while (true) {
            const { value, done } = await logReader.read();
            if (done) break;
            rawContent += logDecoder.decode(value, { stream: true });
          }
          rawContent += logDecoder.decode(); // Final decode
          console.log('Raw API response content:', rawContent);
        } catch (error) {
          console.error('Error logging raw response:', error);
        }
      })();

      res = { ...res, body: processStream };
    }

    if (contentType.includes('text/event-stream') || contentType.includes('event-stream')) {
      return yield* this.processSSEResponse(res.body!);
    }

    const text = await res.text().catch(() => '');
    const message: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    };
    yield text;
    return message;
  }

  private async* processSSEResponse(body: ReadableStream<Uint8Array>): AsyncGenerator<string, Message, unknown> {
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let assembledContent = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          console.log('Received buffer chunk:', buffer);
        }

        const result = this.processSSEBuffer(buffer);
        buffer = result.remainingBuffer;
        console.log('Processing SSE events:', result.events.length);
        assembledContent = yield* this.processSSEEvents(result.events, assembledContent);
      }
    } finally {
      reader.releaseLock();
    }

    console.log('Stream ended, final content:', assembledContent);
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: assembledContent,
      timestamp: new Date(),
    };
  }

  private processSSEBuffer(buffer: string): { events: string[]; remainingBuffer: string } {
    const events: string[] = [];
    let remainingBuffer = buffer;

    let eventEndIndex: number;
    while ((eventEndIndex = remainingBuffer.indexOf('\n\n')) !== -1) {
      const event = remainingBuffer.slice(0, eventEndIndex);
      events.push(event);
      remainingBuffer = remainingBuffer.slice(eventEndIndex + 2);
    }

    return { events, remainingBuffer };
  }

  private async* processSSEEvents(events: string[], currentContent: string): AsyncGenerator<string, string, unknown> {
    let assembledContent = currentContent;

    console.log('Processing', events.length, 'SSE events');
    for (const event of events) {
      console.log('Processing event:', event);
      const eventResult = this.processSSEEvent(event, assembledContent);
      console.log('Event result:', eventResult);
      if (eventResult.done) {
        console.log('Stream done, returning content');
        return eventResult.content;
      }

      assembledContent = eventResult.content;
      if (eventResult.chunk) {
        console.log('Yielding chunk:', eventResult.chunk);
        yield eventResult.chunk;
      }
    }

    return assembledContent;
  }

  private processSSEEvent(event: string, currentContent: string): { done: boolean; content: string; chunk?: string } {
    const lines = event.split('\n');
    console.log('Processing SSE event lines:', lines);

    for (const line of lines) {
      let data: string | null = null;

      if (line.startsWith('data:data: ')) {
        data = line.slice(11).trim();
      } else if (line.startsWith('data: ')) {
        data = line.slice(6).trim();
      }

      if (data !== null) {
        console.log('Found data line:', data);
        if (data === '[DONE]') {
          return { done: true, content: currentContent };
        }
        return { done: false, content: currentContent + data, chunk: data };
      }
    }

    return { done: false, content: currentContent };
  }
}

export const chatService: IChatService = new RealChatService();
export default chatService;

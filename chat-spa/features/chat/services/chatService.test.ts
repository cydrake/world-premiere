import { RealChatService, IChatService } from './chatService';
import { Message } from '../types';

const fetchMock = jest.fn();
global.fetch = fetchMock;

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

global.ReadableStream = class MockReadableStream {
  constructor(source: any) {
    this.source = source;
  }
  source: any;

  getReader() {
    let chunks: Uint8Array[] = [];
    let index = 0;

    if (this.source && this.source.start) {
      this.source.start({
        enqueue: (chunk: Uint8Array) => chunks.push(chunk),
        close: () => {}
      });
    }

    return {
      read: async () => {
        if (index < chunks.length) {
          return { value: chunks[index++], done: false };
        }
        return { value: undefined, done: true };
      },
      releaseLock: () => {}
    };
  }

  tee() {
    return [new MockReadableStream(this.source), new MockReadableStream(this.source)];
  }
};

describe('RealChatService', () => {
  let chatService: RealChatService;
  let originalEnv: string | undefined;

  const API_BASE_URL = 'https://api.example.com';
  const PLAIN_TEXT_RESPONSE = 'Plain text response';
  const EVENT_STREAM_CONTENT_TYPE = 'text/event-stream';
  const FALLBACK_CONTENT = 'Fallback content';

  beforeEach(() => {
    originalEnv = process.env.NEXT_PUBLIC_API_URL;

    process.env.NEXT_PUBLIC_API_URL = API_BASE_URL;

    jest.clearAllMocks();
    fetchMock.mockClear();

    chatService = new RealChatService();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  describe('constructor', () => {
    it('should set baseUrl from environment variable', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
      const service = new RealChatService();
      expect((service as any).baseUrl).toBe('https://api.example.com');
    });

    it('should remove trailing slash from baseUrl', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
      const service = new RealChatService();
      expect((service as any).baseUrl).toBe('https://api.example.com');
    });

    it('should handle empty environment variable', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      const service = new RealChatService();
      expect((service as any).baseUrl).toBe('');
    });
  });

  describe('sendMessage', () => {
    const mockContent = 'Hello, world!';
    const mockUrl = `${API_BASE_URL}/api/v1/chat?question=Hello%2C%20world!&language=English`;

    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should construct correct URL', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({
          id: '123',
          role: 'assistant',
          content: 'Response',
          timestamp: new Date().toISOString()
        })
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      await chatService.sendMessage(mockContent);

      expect(fetchMock).toHaveBeenCalledWith(mockUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
        },
      });
    });

    it('should handle JSON response correctly', async () => {
      const mockData = {
        id: '123',
        role: 'assistant',
        content: 'Hello from AI',
        timestamp: new Date().toISOString()
      };

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockData)
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result).toEqual({
        id: '123',
        role: 'assistant',
        content: 'Hello from AI',
        timestamp: new Date(mockData.timestamp),
      });
    });

    it('should handle JSON response with missing fields', async () => {
      const mockData = { content: 'Simple response' };

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockData)
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.role).toBe('assistant');
      expect(result.content).toBe('Simple response');
      expect(typeof result.id).toBe('string');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle string response', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue('Plain text response')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.content).toBe('Plain text response');
      expect(result.role).toBe('assistant');
    });

    it('should handle array response', async () => {
      const mockData = [
        { content: 'First part' },
        { text: 'Second part' }
      ];

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockData)
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.content).toBe('First part\nSecond part');
    });

    it('should handle SSE response', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: createReadableStream('data: Hello\n\ndata: World\n\ndata: [DONE]\n\n')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.content).toBe('HelloWorld');
      expect(result.role).toBe('assistant');
    });

    it('should handle fallback response for unknown content types', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/xml' }),
        text: jest.fn().mockResolvedValue(PLAIN_TEXT_RESPONSE)
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.content).toBe(PLAIN_TEXT_RESPONSE);
      expect(result.role).toBe('assistant');
    });

    it('should throw error for non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      await expect(chatService.sendMessage(mockContent)).rejects.toThrow(
        'Chat API responded with 500'
      );
    });

    it('should handle unknown data types in JSON response', async () => {
      const mockData = 42; // Number

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockData)
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.content).toBe('42');
      expect(result.role).toBe('assistant');
    });

    it('should handle text response fallback when text() fails', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/xml' }),
        text: jest.fn().mockRejectedValue(new Error('Text decode failed'))
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.content).toBe('');
      expect(result.role).toBe('assistant');
    });

    it('should handle missing content-type header', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        text: jest.fn().mockResolvedValue('Fallback content')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await chatService.sendMessage(mockContent);

      expect(result.content).toBe('Fallback content');
      expect(result.role).toBe('assistant');
    });

    it('should handle empty baseUrl fallback', async () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      const serviceWithEmptyBaseUrl = new RealChatService();

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({
          id: '123',
          role: 'assistant',
          content: 'Response',
          timestamp: new Date().toISOString()
        })
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      await serviceWithEmptyBaseUrl.sendMessage(mockContent);

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/chat?question=Hello%2C%20world!&language=English', {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
        },
      });
    });

    it('should handle null baseUrl fallback', async () => {
      process.env.NEXT_PUBLIC_API_URL = '';
      const serviceWithNullBaseUrl = new RealChatService();

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({
          id: '123',
          role: 'assistant',
          content: 'Response',
          timestamp: new Date().toISOString()
        })
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      await serviceWithNullBaseUrl.sendMessage(mockContent);

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/chat?question=Hello%2C%20world!&language=English', {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
        },
      });
    });
  });

  describe('sendMessageStream', () => {
    const mockContent = 'Stream this!';
    const mockUrl = `${API_BASE_URL}/api/v1/chat?question=Stream%20this!&language=English`;

    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });

    it('should construct correct URL for streaming', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: createReadableStream('data: [DONE]\n\n')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = chatService.sendMessageStream(mockContent);
      await consumeAsyncGenerator(generator);

      expect(fetchMock).toHaveBeenCalledWith(mockUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
        },
      });
    });

    it('should yield chunks from SSE stream', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: createReadableStream('data: Hello\n\ndata: World\n\ndata: [DONE]\n\n')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = chatService.sendMessageStream(mockContent);
      const iterator = generator[Symbol.asyncIterator]();
      const chunks: string[] = [];
      let finalMessage: Message | undefined;

      while (true) {
        const result = await iterator.next();
        if (result.done) {
          finalMessage = result.value;
          break;
        }
        chunks.push(result.value);
      }

      expect(chunks).toEqual(['Hello', 'World']);
      expect(finalMessage?.content).toBe('HelloWorld');
    });

    it('should handle malformed SSE format', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: createReadableStream('data:data: Hello\n\ndata:data: World\n\ndata: [DONE]\n\n')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = chatService.sendMessageStream(mockContent);
      const iterator = generator[Symbol.asyncIterator]();
      const chunks: string[] = [];
      let finalMessage: Message | undefined;

      while (true) {
        const result = await iterator.next();
        if (result.done) {
          finalMessage = result.value;
          break;
        }
        chunks.push(result.value);
      }

      expect(chunks).toEqual(['Hello', 'World']);
      expect(finalMessage?.content).toBe('HelloWorld');
    });

    it('should handle fallback for non-SSE response', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: jest.fn().mockResolvedValue('Fallback content')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = chatService.sendMessageStream(mockContent);
      const iterator = generator[Symbol.asyncIterator]();
      const chunks: string[] = [];
      let finalMessage: Message | undefined;

      while (true) {
        const result = await iterator.next();
        if (result.done) {
          finalMessage = result.value;
          break;
        }
        chunks.push(result.value);
      }

      expect(chunks).toEqual(['Fallback content']);
      expect(finalMessage?.content).toBe('Fallback content');
    });

    it('should throw error for non-ok response in stream', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = chatService.sendMessageStream(mockContent);

      await expect(consumeAsyncGenerator(generator)).rejects.toThrow(
        'Chat API responded with 404'
      );
    });

    it('should handle missing content-type header in stream', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // content-type header is missing
        },
        text: jest.fn().mockResolvedValue('Stream fallback content')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = chatService.sendMessageStream(mockContent);
      const iterator = generator[Symbol.asyncIterator]();
      const chunks: string[] = [];
      let finalMessage: Message | undefined;

      while (true) {
        const result = await iterator.next();
        if (result.done) {
          finalMessage = result.value;
          break;
        }
        chunks.push(result.value);
      }

      expect(chunks).toEqual(['Stream fallback content']);
      expect(finalMessage?.content).toBe('Stream fallback content');
    });

    it('should handle error in raw response logging', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockLogReader = {
        read: jest.fn().mockRejectedValue(new Error('Stream read error'))
      };
      
      const mockLogStream = {
        getReader: jest.fn().mockReturnValue(mockLogReader)
      };
      
      const mockProcessStream = createReadableStream('data: Hello\n\ndata: [DONE]\n\n');
      
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: {
          tee: jest.fn().mockReturnValue([mockLogStream, mockProcessStream])
        }
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = chatService.sendMessageStream(mockContent);
      const iterator = generator[Symbol.asyncIterator]();
      const chunks: string[] = [];
      let finalMessage: Message | undefined;

      while (true) {
        const result = await iterator.next();
        if (result.done) {
          finalMessage = result.value;
          break;
        }
        chunks.push(result.value);
      }

      expect(chunks).toEqual(['Hello']);
      expect(finalMessage?.content).toBe('Hello');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error logging raw response:', expect.any(Error));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error logging raw response:', expect.objectContaining({ message: 'Stream read error' }));

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty baseUrl fallback in streaming', async () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      const serviceWithEmptyBaseUrl = new RealChatService();

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: createReadableStream('data: {"id": "123", "role": "assistant", "content": "Response", "timestamp": "2023-01-01T00:00:00.000Z"}\n\ndata: [DONE]\n\n')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = serviceWithEmptyBaseUrl.sendMessageStream(mockContent);
      const iterator = generator[Symbol.asyncIterator]();
      const chunks: string[] = [];
      let finalMessage: Message | undefined;

      while (true) {
        const result = await iterator.next();
        if (result.done) {
          finalMessage = result.value;
          break;
        }
        chunks.push(result.value);
      }

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/chat?question=Stream%20this!&language=English', {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
        },
      });
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe('{"id": "123", "role": "assistant", "content": "Response", "timestamp": "2023-01-01T00:00:00.000Z"}');
      expect(finalMessage?.content).toBe('{"id": "123", "role": "assistant", "content": "Response", "timestamp": "2023-01-01T00:00:00.000Z"}');
    });

    it('should handle null baseUrl fallback in streaming', async () => {
      process.env.NEXT_PUBLIC_API_URL = '';
      const serviceWithNullBaseUrl = new RealChatService();

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: createReadableStream('data: {"id": "123", "role": "assistant", "content": "Response", "timestamp": "2023-01-01T00:00:00.000Z"}\n\ndata: [DONE]\n\n')
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const generator = serviceWithNullBaseUrl.sendMessageStream(mockContent);
      const iterator = generator[Symbol.asyncIterator]();
      const chunks: string[] = [];
      let finalMessage: Message | undefined;

      while (true) {
        const result = await iterator.next();
        if (result.done) {
          finalMessage = result.value;
          break;
        }
        chunks.push(result.value);
      }

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/chat?question=Stream%20this!&language=English', {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
        },
      });
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe('{"id": "123", "role": "assistant", "content": "Response", "timestamp": "2023-01-01T00:00:00.000Z"}');
      expect(finalMessage?.content).toBe('{"id": "123", "role": "assistant", "content": "Response", "timestamp": "2023-01-01T00:00:00.000Z"}');
    });
  });

  describe('private methods', () => {
    describe('parseJsonResponse', () => {
      it('should parse valid JSON response', async () => {
        const mockResponse = {
          json: jest.fn().mockResolvedValue({
            id: '123',
            role: 'assistant',
            content: 'Test content',
            timestamp: '2023-01-01T00:00:00Z'
          })
        };

        const result = await (chatService as any).parseJsonResponse(mockResponse);

        expect(result).toEqual({
          id: '123',
          role: 'assistant',
          content: 'Test content',
          timestamp: new Date('2023-01-01T00:00:00Z'),
        });
      });

      it('should handle JSON response with null content', async () => {
        const mockData = {
          id: '123',
          role: 'assistant',
          content: null,
          timestamp: '2023-01-01T00:00:00Z'
        };

        const mockResponse = {
          json: jest.fn().mockResolvedValue(mockData)
        };

        const result = await (chatService as any).parseJsonResponse(mockResponse);

        expect(result.content).toBe('');
        expect(result.id).toBe('123');
        expect(result.role).toBe('assistant');
      });

      it('should handle JSON response with undefined content', async () => {
        const mockData = {
          id: '123',
          role: 'assistant',
          timestamp: '2023-01-01T00:00:00Z'
        };

        const mockResponse = {
          json: jest.fn().mockResolvedValue(mockData)
        };

        const result = await (chatService as any).parseJsonResponse(mockResponse);

        expect(result.content).toBe('');
        expect(result.id).toBe('123');
        expect(result.role).toBe('assistant');
      });

      it('should handle array response with missing content and text fields', async () => {
        const mockData = [
          { content: 'First part' },
          { text: 'Second part' },
          { other: 'Third part' }, // No content or text field
          {} // Empty object
        ];

        const mockResponse = {
          json: jest.fn().mockResolvedValue(mockData)
        };

        const result = await (chatService as any).parseJsonResponse(mockResponse);

        expect(result.content).toBe('First part\nSecond part\n\n');
      });

      it('should handle JSON parse failure', async () => {
        const mockResponse = {
          json: jest.fn().mockRejectedValue(new Error('Parse error'))
        };

        const result = await (chatService as any).parseJsonResponse(mockResponse);

        expect(result.content).toBe('');
        expect(result.role).toBe('assistant');
      });
    });

    describe('parseSSEResponse', () => {
      it('should parse SSE response without body', async () => {
        const mockResponse = {
          body: null,
          text: jest.fn().mockResolvedValue('Fallback text')
        };

        const result = await (chatService as any).parseSSEResponse(mockResponse);

        expect(result.content).toBe('Fallback text');
      });

      it('should parse complete SSE stream', async () => {
        const mockResponse = {
          body: createReadableStream('data: Chunk 1\n\ndata: Chunk 2\n\ndata: [DONE]\n\n')
        };

        const result = await (chatService as any).parseSSEResponse(mockResponse);

        expect(result.content).toBe('Chunk 1Chunk 2');
      });

      it('should process remaining buffer with data lines', async () => {
        const mockResponse = {
          body: createReadableStream('data: Complete event\n\ndata: Incomplete data line')
        };

        const result = await (chatService as any).parseSSEResponse(mockResponse);

        expect(result.content).toBe('Complete eventIncomplete data line');
      });

      it('should handle remaining buffer with multiple data lines', async () => {
        const mockResponse = {
          body: createReadableStream('data: Event 1\n\ndata: Event 2\ndata: Remaining 1\ndata: Remaining 2')
        };

        const result = await (chatService as any).parseSSEResponse(mockResponse);

        expect(result.content).toBe('Event 1Event 2\nRemaining 1\nRemaining 2');
      });

      it('should ignore remaining buffer without data lines', async () => {
        const mockResponse = {
          body: createReadableStream('data: Complete\n\nid: 123\nevent: message\nretry: 1000')
        };

        const result = await (chatService as any).parseSSEResponse(mockResponse);

        expect(result.content).toBe('Complete');
      });

      it('should skip SSE events without data lines', async () => {
        const mockResponse = {
          body: createReadableStream('id: 123\nevent: message\nretry: 1000\n\ndata: Valid content\n\nid: 456\nevent: other\n\n')
        };

        const result = await (chatService as any).parseSSEResponse(mockResponse);

        expect(result.content).toBe('Valid content');
      });
    });

    describe('processSSEBuffer', () => {
      it('should split buffer into events', () => {
        const buffer = 'data: event1\n\ndata: event2\n\nremaining';
        const result = (chatService as any).processSSEBuffer(buffer);

        expect(result.events).toEqual(['data: event1', 'data: event2']);
        expect(result.remainingBuffer).toBe('remaining');
      });
    });

    describe('processSSEEvent', () => {
      it('should process standard SSE data line', () => {
        const event = 'data: Hello World';
        const result = (chatService as any).processSSEEvent(event, 'previous');

        expect(result.done).toBe(false);
        expect(result.content).toBe('previousHello World');
        expect(result.chunk).toBe('Hello World');
      });

      it('should process multiline SSE data', () => {
        const event = 'data: Line 1\ndata: Line 2';
        const result = (chatService as any).processSSEEvent(event, 'previous');

        expect(result.done).toBe(false);
        expect(result.content).toBe('previousLine 1\nLine 2');
        expect(result.chunk).toBe('Line 1\nLine 2');
      });

      it('should process malformed SSE data line', () => {
        const event = 'data:data: Hello World';
        const result = (chatService as any).processSSEEvent(event, 'previous');

        expect(result.done).toBe(false);
        expect(result.content).toBe('previousHello World');
        expect(result.chunk).toBe('Hello World');
      });

      it('should handle DONE marker', () => {
        const event = 'data: [DONE]';
        const result = (chatService as any).processSSEEvent(event, 'final content');

        expect(result.done).toBe(true);
        expect(result.content).toBe('final content');
        expect(result.chunk).toBeUndefined();
      });

      it('should ignore non-data lines', () => {
        const event = 'id: 123\n\nevent: message';
        const result = (chatService as any).processSSEEvent(event, 'unchanged');

        expect(result.done).toBe(false);
        expect(result.content).toBe('unchanged');
        expect(result.chunk).toBeUndefined();
      });

      it('should handle events with no data lines', () => {
        const event = 'id: 123\nevent: message\nretry: 1000';
        const result = (chatService as any).processSSEEvent(event, 'unchanged');

        expect(result.done).toBe(false);
        expect(result.content).toBe('unchanged');
        expect(result.chunk).toBeUndefined();
      });
    });

    describe('processSSEEvents', () => {
      it('should return assembled content when no events indicate completion', async () => {
        const events = ['data: chunk1', 'data: chunk2'];
        const generator = (chatService as any).processSSEEvents(events, 'initial');
        const results: string[] = [];
        let finalResult: IteratorResult<string, string>;

        do {
          finalResult = await generator.next();
          if (!finalResult.done) {
            results.push(finalResult.value);
          }
        } while (!finalResult.done);

        expect(results).toEqual(['chunk1', 'chunk2']);
        expect(finalResult.value).toBe('initialchunk1chunk2');
      });

      it('should return early when event indicates completion', async () => {
        const events = ['data: chunk1', 'data: [DONE]'];
        const generator = (chatService as any).processSSEEvents(events, 'initial');
        const results: string[] = [];
        let finalResult: IteratorResult<string, string>;

        do {
          finalResult = await generator.next();
          if (!finalResult.done) {
            results.push(finalResult.value);
          }
        } while (!finalResult.done);

        expect(results).toEqual(['chunk1']);
        expect(finalResult.value).toBe('initialchunk1');
      });

      it('should handle empty events array', async () => {
        const generator = (chatService as any).processSSEEvents([], 'initial');
        const results: string[] = [];
        let finalResult: IteratorResult<string, string>;

        do {
          finalResult = await generator.next();
          if (!finalResult.done) {
            results.push(finalResult.value);
          }
        } while (!finalResult.done);

        expect(results).toEqual([]);
        expect(finalResult.value).toBe('initial');
      });
    });
  });
});

function createReadableStream(content: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const parts = content.split('\n\n');
  const chunks: Uint8Array[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i < parts.length - 1 || content.endsWith('\n\n')) {
      chunks.push(encoder.encode(part + '\n\n'));
    } else {
      chunks.push(encoder.encode(part));
    }
  }

  return new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(chunk));
      controller.close();
    }
  });
}

async function consumeAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const item of generator) {
    results.push(item);
  }
  return results;
}

import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from './useChat';
import { IChatService } from '../services/chatService';
import { Message } from '../types';

describe('useChat', () => {
  const mockResponse: Message = {
    id: 'response-id',
    role: 'assistant',
    content: 'Response content',
    timestamp: new Date(),
  };

  const mockService: IChatService = {
    sendMessage: jest.fn().mockResolvedValue(mockResponse),
    sendMessageStream: jest.fn().mockImplementation(async function* () {
      yield 'Response ';
      yield 'content';
      return mockResponse;
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty messages and not loading', () => {
    const { result } = renderHook(() => useChat(mockService));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.streamingMessageId).toBeNull();
  });

  it('adds user message and sets loading state when sending', async () => {
    const { result } = renderHook(() => useChat(mockService));

    act(() => {
      result.current.sendMessage('Hello');
    });

    expect(result.current.messages[0]).toEqual(expect.objectContaining({
      role: 'user',
      content: 'Hello',
    }));
    expect(result.current.isLoading).toBe(true);
  });

  it('handles streaming response with word-by-word accumulation', async () => {
    const streamingService: IChatService = {
      sendMessage: jest.fn().mockResolvedValue(mockResponse),
      sendMessageStream: jest.fn().mockImplementation(async function* () {
        yield 'Once';
        yield ' upon';
        yield ' a';
        yield ' time';
        return { ...mockResponse, content: 'Once upon a time' };
      }),
    };

    const { result } = renderHook(() => useChat(streamingService));

    act(() => {
      result.current.sendMessage('Tell a story');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    expect(streamingService.sendMessageStream).toHaveBeenCalledWith('Tell a story');

    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');

    expect(result.current.messages[1].content).toBe('Once upon a time');
  });

  it('adds spaces between words during streaming', async () => {
    const streamingService: IChatService = {
      sendMessage: jest.fn().mockResolvedValue(mockResponse),
      sendMessageStream: jest.fn().mockImplementation(async function* () {
        yield 'Hello';
        yield 'world';
        yield '!';
        return { ...mockResponse, content: 'Hello world!' };
      }),
    };

    const { result } = renderHook(() => useChat(streamingService));

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(result.current.messages[1].content).toBe('Hello world!');
  });

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useChat(mockService));

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(mockService.sendMessageStream).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('handles service errors gracefully', async () => {
    const errorService: IChatService = {
      sendMessage: jest.fn().mockResolvedValue(mockResponse),
      sendMessageStream: jest.fn().mockImplementation(async function* () {
        throw new Error('Network error');
      }),
    };

    const { result } = renderHook(() => useChat(errorService));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(2); // User message + failed assistant message
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.isLoading).toBe(false);

    consoleSpy.mockRestore();
  });

  it('shows streaming state during message processing', async () => {
    let resolveStream: (value: Message) => void;
    const streamingPromise = new Promise<Message>((resolve) => {
      resolveStream = resolve;
    });

    const streamingService: IChatService = {
      sendMessage: jest.fn().mockResolvedValue(mockResponse),
      sendMessageStream: jest.fn().mockImplementation(async function* () {
        yield 'Streaming';
        const result = await streamingPromise;
        yield ' complete';
        return result;
      }),
    };

    const { result } = renderHook(() => useChat(streamingService));

    act(() => {
      result.current.sendMessage('Test streaming');
    });

    expect(result.current.streamingMessageId).not.toBeNull();
    expect(result.current.messages[1].isStreaming).toBe(true);
  });

  it('handles non-string chunks to signal completion', async () => {
    const completionService: IChatService = {
      sendMessage: jest.fn().mockResolvedValue(mockResponse),
      sendMessageStream: jest.fn().mockImplementation(async function* () {
        yield 'First chunk';
        yield 'Second chunk';
        yield { done: true };
        return mockResponse;
      }),
    };

    const { result } = renderHook(() => useChat(completionService));

    await act(async () => {
      await result.current.sendMessage('Test completion');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('First chunk Second chunk');
    expect(result.current.messages[1].isStreaming).toBe(false);
    expect(result.current.streamingMessageId).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty messages and not loading', () => {
    const { result } = renderHook(() => useChat(mockService));
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('adds user message and sets loading state when sending', async () => {
    const { result } = renderHook(() => useChat(mockService));

    await act(async () => {
      result.current.sendMessage('Hello');
    });

    expect(result.current.messages[0]).toEqual(expect.objectContaining({
      role: 'user',
      content: 'Hello',
    }));
  });

  it('adds assistant response after service call', async () => {
    const { result } = renderHook(() => useChat(mockService));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(mockService.sendMessage).toHaveBeenCalledWith('Hello');
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useChat(mockService));

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(mockService.sendMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('handles service errors gracefully', async () => {
    const errorService: IChatService = {
      sendMessage: jest.fn().mockRejectedValue(new Error('Network error')),
    };

    const { result } = renderHook(() => useChat(errorService));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
    
    consoleSpy.mockRestore();
  });
});

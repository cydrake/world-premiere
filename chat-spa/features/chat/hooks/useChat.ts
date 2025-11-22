import { useState, useCallback } from 'react';
import { Message } from '../types';
import { IChatService, chatService } from '../services/chatService';

export function useChat(service: IChatService = chatService) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await service.sendMessage(content);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
}

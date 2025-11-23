import { useState, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Message } from '../types';
import { IChatService, chatService } from '../services/chatService';

export function useChat(service: IChatService = chatService) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const streamingMessageIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    console.log('sendMessage called with:', content);
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
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      streamingMessageIdRef.current = assistantMessageId;

      const stream = service.sendMessageStream(content);
      let accumulatedContent = '';
      for await (const chunk of stream) {
        console.log('chunk:', chunk);
        if (typeof chunk === 'string') {
          if (accumulatedContent.length > 0 && 
              !accumulatedContent.endsWith(' ') && 
              !accumulatedContent.endsWith('\n') &&
              chunk.trim().length > 0 && 
              !chunk.startsWith(' ') &&
              !chunk.startsWith('\n') &&
              !chunk.startsWith('.') &&
              !chunk.startsWith(',') &&
              !chunk.startsWith('!') &&
              !chunk.startsWith('?') &&
              !chunk.startsWith(':') &&
              !chunk.startsWith(';')) {
            accumulatedContent += ' ';
          }
          accumulatedContent += chunk;
          flushSync(() => {
            setMessages((prev) =>
              prev.map((msg) => {
                console.log('MEssage:', msg);
                return msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg;
              })
            );
          });
        } else {
          flushSync(() => {
            setMessages((prev) =>
              prev.map((msg) => {
                 console.log('MEssage:', msg);
                return msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg;
              })
            );
          });
          streamingMessageIdRef.current = null;
          break;
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      flushSync(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== streamingMessageIdRef.current));
      });
      streamingMessageIdRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return {
    messages,
    isLoading,
    sendMessage,
    streamingMessageId: streamingMessageIdRef.current,
  };
}

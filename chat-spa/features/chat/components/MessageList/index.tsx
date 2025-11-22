import React, { useRef, useEffect } from 'react';
import { Message } from '../../types';
import { MessageBubble } from '../MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col pb-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex w-full items-start gap-4 p-4 flex-row">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow bg-white text-slate-600 border-slate-200">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          </div>
          <div className="flex min-h-[60px] flex-1 flex-col rounded-lg border px-4 py-3 shadow-sm bg-white border-slate-200">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

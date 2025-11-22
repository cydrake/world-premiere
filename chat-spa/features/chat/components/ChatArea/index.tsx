import React from 'react';
import { ChatInput } from '../ChatInput';
import { MessageList } from '../MessageList';
import { EmptyChatState } from '../EmptyChatState';
import { Message } from '../../types';

interface ChatAreaProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatArea({ messages, onSend, isLoading }: ChatAreaProps) {
  return (
    <div className="flex flex-col flex-1 h-screen bg-amber-50 relative bg-[url('/paper-texture.png')]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-amber-100 bg-amber-50/95 px-6 py-4 backdrop-blur shadow-sm">
        <div className="font-bold text-xl text-amber-900 flex items-center gap-2">
          <span className="text-2xl">✨</span> Once Upon a Time...
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl w-full">
          {messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}

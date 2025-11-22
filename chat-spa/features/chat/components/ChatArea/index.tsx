import React from 'react';
import { ChatInput } from '../ChatInput';
import { MessageList } from '../MessageList';
import { EmptyChatState } from '../EmptyChatState';
import { Message } from '../../types';
import styles from './styles.module.css';

interface ChatAreaProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatArea({ messages, onSend, isLoading }: ChatAreaProps) {
  return (
    <div id="chat-area" className="flex flex-col flex-1 h-screen bg-slate-50 relative overflow-hidden">
      <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 relative">
        <div id="chat-background" className={`absolute inset-0 z-0 ${styles.magicalBackground}`} />
        <div id="chat-content" className="mx-auto max-w-3xl w-full relative z-10">
          {messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
        </div>
      </div>

      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}

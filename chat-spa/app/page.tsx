'use client';

import React from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { ChatArea } from '@/features/chat/components/ChatArea';
import { useChat } from '@/features/chat/hooks/useChat';

export default function Home() {
  const { messages, isLoading, sendMessage } = useChat();

  return (
    <ChatLayout>
      <ChatArea 
        messages={messages} 
        onSend={sendMessage} 
        isLoading={isLoading} 
      />
    </ChatLayout>
  );
}
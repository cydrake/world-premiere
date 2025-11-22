import React from 'react';
import { ChatSidebar } from '../ChatSidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div id="chat-layout" className="flex h-screen w-full overflow-hidden font-medium">
      <ChatSidebar />
      <main id="chat-main" className="flex-1 flex flex-col h-full overflow-hidden bg-white/30 backdrop-blur-sm">
        {children}
      </main>
    </div>
  );
}

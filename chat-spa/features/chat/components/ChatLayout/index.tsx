import React from 'react';
import { ChatSidebar } from '../ChatSidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-amber-50 font-medium">
      <ChatSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-amber-50/50">
        {children}
      </main>
    </div>
  );
}

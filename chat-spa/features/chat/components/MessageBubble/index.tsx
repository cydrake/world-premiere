import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/atoms/Avatar';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3 p-4 group transition-all hover:scale-[1.01]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar variant={isUser ? 'user' : 'bot'} />
      <div
        className={cn(
          "flex min-h-[60px] max-w-[80%] flex-col px-6 py-4 shadow-md relative",
          isUser 
            ? "bg-orange-100 text-orange-900 rounded-2xl rounded-br-none border-2 border-orange-200" 
            : "bg-white text-slate-800 rounded-2xl rounded-bl-none border-2 border-slate-100"
        )}
      >
        <div className="text-base font-medium whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
        {message.timestamp && (
          <div className={cn(
            "text-[10px] mt-2 font-bold opacity-50",
            isUser ? "text-right" : "text-left"
          )}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

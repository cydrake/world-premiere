import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot, LucideIcon } from 'lucide-react';

interface AvatarProps {
  icon?: LucideIcon;
  fallback?: string;
  className?: string;
  variant?: 'user' | 'bot';
}

export function Avatar({ icon: Icon, className, variant = 'bot' }: AvatarProps) {
  const isUser = variant === 'user';
  
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full border-2 shadow-md transition-transform hover:scale-110",
        isUser 
          ? "bg-orange-400 text-white border-orange-200" 
          : "bg-indigo-100 text-indigo-600 border-indigo-200",
        className
      )}
    >
      {Icon ? <Icon size={20} /> : (isUser ? <User size={20} /> : <Bot size={20} />)}
    </div>
  );
}

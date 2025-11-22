import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="p-6 border-t-2 border-amber-100 bg-amber-50/95 backdrop-blur">
      <div className="relative flex items-end gap-3 max-w-3xl mx-auto w-full p-3 border-2 border-amber-200 rounded-3xl shadow-sm focus-within:ring-4 focus-within:ring-amber-200/50 focus-within:border-amber-400 transition-all bg-white">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your story here..."
          disabled={disabled}
          className="w-full max-h-[200px] min-h-[24px] resize-none bg-transparent border-none focus:ring-0 p-2 text-lg placeholder:text-amber-300 text-amber-900 outline-none font-medium"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="icon"
          className="mb-0.5 h-10 w-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
          icon={SendHorizontal}
        />
      </div>
      <div className="text-center text-xs font-bold text-amber-300 mt-3 uppercase tracking-widest">
        ✨ Magic in progress ✨
      </div>
    </div>
  );
}

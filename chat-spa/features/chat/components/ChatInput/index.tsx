import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import styles from './styles.module.css';
import chatService from '../../services/chatService';

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!input.trim() || disabled) return;

    const message = input.trim();
    if (onSend) {
      onSend(message);
      setInput('');
      return;
    }

    try {
      setInput('');
      await chatService.sendMessage(message);
    } catch (err) {
      console.error('chatService.sendMessage failed', err);
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
    <div id="chat-input-container" className="p-6 bg-pink-900/90 backdrop-blur relative overflow-hidden">
      <div id="wave-animation" className={styles.waveTop}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            id={`wave-${i}`}
            className={[styles.oceanWave, styles[`wave${i}`]].join(' ')}
          ></div>
        ))}
      </div>
      <div id="bubble-background" className={styles.waveBackground}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={styles.bubble}></div>
        ))}
      </div>
      <div id="input-wrapper" className="relative flex items-end gap-3 max-w-3xl mx-auto w-full p-3 border-2 border-pink-700 rounded-3xl shadow-sm focus-within:ring-4 focus-within:ring-pink-700/50 focus-within:border-pink-600 transition-all bg-white z-10">
        <textarea
          id="message-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your wish here..."
          disabled={disabled}
          className={`w-full max-h-[200px] min-h-[24px] resize-none bg-transparent border-none focus:ring-0 p-2 text-lg placeholder:text-slate-400 text-slate-900 outline-none font-medium ${disabled ? 'cursor-not-allowed' : ''}`}
          rows={1}
        />
        <div className="relative group">
          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            size="icon"
            className={`mb-0.5 h-10 w-10 rounded-full bg-pink-700 hover:bg-pink-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105 ${!input.trim() || disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            icon={SendHorizontal}
          />
          {(!input.trim() || disabled) && (
            <span className="absolute left-1/2 -top-9 -translate-x-1/2 px-3 py-1 rounded bg-slate-800 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
              What kind of story do you wish?
            </span>
          )}
        </div>
      </div>
      <div id="input-footer" className="text-center text-xs font-bold text-pink-300 mt-3 uppercase tracking-widest relative z-10">
        ✨ Magic in progress ✨
      </div>
    </div>
  );
}

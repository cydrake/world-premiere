import React from 'react';
import Image from 'next/image';

export function EmptyChatState() {
  return (
    <div id="empty-chat-state" className="flex h-full items-center justify-center p-4">
      <div id="welcome-card" className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 pb-6 text-center max-w-lg w-full">
        <div className="mb-6 flex flex-col items-center justify-center gap-1">
          <div id="welcome-icon" className="relative rounded-full bg-indigo-100 p-8 shadow-inner animate-bounce mb-2 w-fit flex items-center justify-center" style={{boxShadow: '0 8px 32px 0 rgba(80, 60, 180, 0.25), 0 0 0 8px rgba(99,102,241,0.10)'}}>
            <span className="absolute left-4 top-4 w-6 h-6 bg-white/80 rounded-full blur-[2px] z-10"></span>
            <Image src="/favicon.png" alt="Teu Tale" width={64} height={64} className="object-contain relative z-20" />
          </div>
          <div className="flex items-center justify-center">
            <div className="h-1 bg-slate-500 rounded-md animate-[shadowWidth_1s_ease-in-out_infinite]" style={{ width: '20px', margin: '0 auto' }}></div>
          </div>
        </div>
        <h2 id="welcome-title" className="text-3xl font-bold text-slate-800 mb-4">
          Welcome to Teu Tale!
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          I can tell you magical stories, answer curious questions, or just have a friendly chat. What shall we do today?
        </p>
      </div>
    </div>
  );
}

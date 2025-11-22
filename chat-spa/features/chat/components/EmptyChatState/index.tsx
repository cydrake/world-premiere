import React from 'react';

export function EmptyChatState() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center p-8">
      <div className="rounded-full bg-amber-100 p-8 mb-6 shadow-inner animate-bounce">
        <div className="h-16 w-16 text-amber-500 flex items-center justify-center text-5xl">🏰</div>
      </div>
      <h2 className="text-3xl font-bold text-amber-900 mb-4 font-serif">
        Welcome to Teu Tale!
      </h2>
      <p className="text-lg text-amber-700/70 max-w-md leading-relaxed font-medium">
        I can tell you magical stories, answer curious questions, or just have a friendly chat. What shall we do today?
      </p>
    </div>
  );
}

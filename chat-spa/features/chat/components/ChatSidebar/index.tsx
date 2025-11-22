import React from 'react';
import { MessageSquare, Plus, Settings, History } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export function ChatSidebar() {
  return (
    <div className="hidden md:flex w-[280px] flex-col bg-indigo-900 text-indigo-100 h-screen border-r-4 border-indigo-800 shadow-xl z-20">
      <div className="p-4 bg-indigo-950/50">
        <div className="mb-4 px-2 text-xl font-bold text-indigo-200 flex items-center gap-2">
          <span>📚</span> Teu Tale
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start border-2 border-indigo-400/30 bg-indigo-800/50 hover:bg-indigo-700 text-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all"
          icon={Plus}
        >
          Start New Story
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-2 px-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Your Adventures</div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Button
              key={i}
              variant="ghost"
              className="w-full justify-start hover:bg-indigo-800 text-indigo-200 font-medium rounded-xl px-4 py-6 transition-all hover:translate-x-1"
              icon={MessageSquare}
            >
              <span className="truncate">The Magical Forest {i}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-indigo-800 p-4 space-y-2 bg-indigo-950/30">
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-indigo-800 text-indigo-200 rounded-xl"
          icon={History}
        >
          Past Stories
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-indigo-800 text-indigo-200 rounded-xl"
          icon={Settings}
        >
          Magic Settings
        </Button>
      </div>
    </div>
  );
}

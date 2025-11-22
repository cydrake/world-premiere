import React, { useState } from 'react';
import { MessageSquare, Plus, Settings, History } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div id="chat-sidebar" className={`hidden md:flex flex-col bg-slate-800 text-slate-100 h-screen border-r-4 border-slate-700 shadow-xl z-20 transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-[280px]'}`}>
      <div id="sidebar-header" className="p-4 bg-slate-900/50">
        <button 
          id="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`mb-4 px-2 flex items-center gap-2 select-none cursor-pointer hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <span className="text-2xl">✨</span>
          {!isCollapsed && (
            <h1 className="font-extrabold text-2xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent m-0 p-0 animate-[fadeIn_1s_ease-in-out]">
              Teu Tale
            </h1>
          )}
        </button>
        <Button 
          variant="ghost" 
          className={`w-full border-2 border-slate-600/30 bg-slate-700/50 hover:bg-slate-600 text-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
          icon={Plus}
        >
          {!isCollapsed && <span className="animate-[fadeIn_1s_ease-in-out]">Start New Story</span>}
        </Button>
      </div>

      <div id="sidebar-adventures" className="flex-1 overflow-hidden px-3 py-2">
        {!isCollapsed && <div className="mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider animate-[fadeIn_1s_ease-in-out]">Your Adventures</div>}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Button
              key={i}
              variant="ghost"
              className={`w-full hover:bg-slate-700 text-slate-300 font-medium rounded-xl py-6 transition-all cursor-pointer ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4 hover:translate-x-1'}`}
              icon={MessageSquare}
            >
              {!isCollapsed && <span className="truncate animate-[fadeIn_1s_ease-in-out]">The Magical Forest {i}</span>}
            </Button>
          ))}
        </div>
      </div>

      <div id="sidebar-footer" className="border-t border-slate-700 p-4 space-y-2 bg-slate-900/30 overflow-hidden">
        <Button 
          variant="ghost" 
          className={`w-full hover:bg-slate-700 text-slate-300 rounded-xl transition-all duration-300 cursor-pointer ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
          icon={History}
        >
          {!isCollapsed && <span className="animate-[fadeIn_1s_ease-in-out]">Past Stories</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full hover:bg-slate-700 text-slate-300 rounded-xl transition-all duration-300 cursor-pointer ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
          icon={Settings}
        >
          {!isCollapsed && <span className="animate-[fadeIn_1s_ease-in-out]">Magic Settings</span>}
        </Button>
      </div>
    </div>
  );
}

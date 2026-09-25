import React from 'react';
import { Sun, Moon, Trash2, Sliders, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'testbench' | 'knowledge' | 'code';
  setActiveTab: (tab: 'chat' | 'testbench' | 'knowledge' | 'code') => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  onClearChat: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onClearChat,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenSettings
}) => {
  return (
    <header className="h-16 px-4 md:px-7 flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#201E24] shrink-0 relative z-50 transition-colors">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer pointer-events-auto"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className="text-lg font-bold tracking-tight text-stone-900 dark:text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          NexaFAQ AI
        </button>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-stone-600 dark:text-stone-300">
        <button
          onClick={() => setActiveTab('chat')}
          className={`transition-colors py-1 cursor-pointer ${
            activeTab === 'chat'
              ? 'text-[#6842E8] dark:text-[#8A69FF] font-semibold border-b-2 border-[#6842E8] dark:border-[#8A69FF]'
              : 'hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          Assistant
        </button>
        <button
          onClick={() => setActiveTab('testbench')}
          className={`transition-colors py-1 cursor-pointer ${
            activeTab === 'testbench'
              ? 'text-[#6842E8] dark:text-[#8A69FF] font-semibold border-b-2 border-[#6842E8] dark:border-[#8A69FF]'
              : 'hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          11-Case Benchmark
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`transition-colors py-1 cursor-pointer ${
            activeTab === 'knowledge'
              ? 'text-[#6842E8] dark:text-[#8A69FF] font-semibold border-b-2 border-[#6842E8] dark:border-[#8A69FF]'
              : 'hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          Knowledge Base (55)
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`transition-colors py-1 cursor-pointer ${
            activeTab === 'code'
              ? 'text-[#6842E8] dark:text-[#8A69FF] font-semibold border-b-2 border-[#6842E8] dark:border-[#8A69FF]'
              : 'hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          Code & Architecture
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 relative z-50">
        <button
          onClick={onOpenSettings}
          className="p-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded border border-black/[0.08] dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer pointer-events-auto"
          title="Threshold Settings"
          aria-label="NLP Threshold Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          id="theme-toggle-btn"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTheme(theme === 'light' ? 'dark' : 'light');
          }}
          className="p-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded border border-black/[0.08] dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer pointer-events-auto select-none"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          data-testid="theme-toggle"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          id="clear-chat-btn"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClearChat();
          }}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 rounded border border-black/[0.08] dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors whitespace-nowrap cursor-pointer pointer-events-auto select-none"
          title="Clear Chat Conversation"
          aria-label="Clear Chat Conversation"
          data-testid="clear-chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </header>
  );
};

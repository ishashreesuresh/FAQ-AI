/**
 * NexaFAQ AI — Intelligent FAQ Assistant
 * CodeAlpha Artificial Intelligence Internship - Task 2: Chatbot for FAQs
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, CornerDownLeft, Filter } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { TestBenchView } from './components/TestBenchView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { SettingsModal } from './components/SettingsModal';
import { defaultNlpEngine } from './nlp/nlpEngine';
import { ChatMessage } from './types';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-0',
  sender: 'ai',
  text: "Hi! I'm NexaFAQ AI. Ask me anything about the platform, account, billing, support, or security.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isWelcome: true
};

const SUGGESTED_PROMPTS = [
  "How do I reset my password?",
  "How can I change my email?",
  "Where can I view my billing details?",
  "How do I cancel my subscription?",
  "How can I contact support?"
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'testbench' | 'knowledge' | 'code'>('chat');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme') || localStorage.getItem('nexafaq_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nexafaq_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [INITIAL_WELCOME_MESSAGE];
      }
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexafaq_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highThreshold, setHighThreshold] = useState(0.65);
  const [minThreshold, setMinThreshold] = useState(0.40);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('nexafaq_theme', theme);
    } catch {
      // Ignored in private/sandboxed browsing
    }
  }, [theme]);

  // Sync messages
  useEffect(() => {
    localStorage.setItem('nexafaq_messages', JSON.stringify(messages));
  }, [messages]);

  // Sync history
  useEffect(() => {
    localStorage.setItem('nexafaq_history', JSON.stringify(recentQueries));
  }, [recentQueries]);

  // Sync threshold settings into local NLP engine
  useEffect(() => {
    defaultNlpEngine.highThreshold = highThreshold;
    defaultNlpEngine.minThreshold = minThreshold;
  }, [highThreshold, minThreshold]);

  // Auto scroll to bottom
  useEffect(() => {
    if (activeTab === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, activeTab]);

  const handleSend = (queryText?: string) => {
    const textToSend = (queryText !== undefined ? queryText : inputQuery).trim();
    if (!textToSend || isTyping) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: time
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 2. Update search history
    setRecentQueries((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== textToSend.toLowerCase());
      return [textToSend, ...filtered].slice(0, 20);
    });

    // 3. Process with NLP engine
    setIsTyping(true);

    setTimeout(() => {
      // Execute authentic local TF-IDF Cosine Similarity pipeline
      const matchResult = defaultNlpEngine.findBestMatch(textToSend, selectedCategory);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: matchResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchData: matchResult
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setActiveTab('chat');
    // Return chat area to its initial welcome message state with current timestamp
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: "Hi! I'm NexaFAQ AI. Ask me anything about the platform, account, billing, support, or security.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isWelcome: true
      }
    ]);
    // Reset input field and any typing/loading state
    setInputQuery('');
    setIsTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    try {
      localStorage.removeItem('nexafaq_messages');
      localStorage.removeItem('messages');
    } catch {
      // Ignored
    }
  };

  const handleClearHistory = () => {
    setRecentQueries([]);
    localStorage.removeItem('nexafaq_history');
  };

  const handleSelectQueryFromHistory = (q: string) => {
    setActiveTab('chat');
    handleSend(q);
  };

  const handleRunInChatFromBenchmark = (q: string) => {
    setActiveTab('chat');
    handleSend(q);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8F6F1] dark:bg-[#171619] text-stone-900 dark:text-stone-100 antialiased font-sans transition-colors duration-200">
      {/* 3-Zone Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        onClearChat={handleClearChat}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (Categories & Session History) */}
        {activeTab === 'chat' && (
          <Sidebar
            categories={defaultNlpEngine.categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            recentQueries={recentQueries}
            onSelectQuery={handleSelectQueryFromHistory}
            onClearHistory={handleClearHistory}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}

        {/* View Routing */}
        {activeTab === 'chat' && (
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F6F1] dark:bg-[#171619] relative">
            {/* Sub-header info bar */}
            <div className="px-6 py-2 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-[#201E24]/50 backdrop-blur-xs flex items-center justify-between text-xs text-stone-500 shrink-0">
              <div className="flex items-center gap-2">
                <span>Ask naturally. Find the right answer instantly.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-400">Filtering:</span>
                <span className="font-semibold text-[#6842E8] dark:text-[#8A69FF]">
                  {selectedCategory}
                </span>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-[11px] underline hover:text-stone-900 dark:hover:text-white"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-3">
                    <ChatMessageBubble
                      message={msg}
                      onSelectSuggestion={(q) => handleSend(q)}
                      onRetry={(orig) => handleSend(orig)}
                    />

                    {/* Interactive Suggested Questions below AI welcome card */}
                    {msg.isWelcome && (
                      <div className="ml-11 max-w-lg space-y-2 pt-1">
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400">
                          Suggested Questions
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {SUGGESTED_PROMPTS.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(prompt)}
                              className="text-left text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-[#201E24] hover:bg-[#EEE9FF] dark:hover:bg-[#2D2545] hover:text-[#6842E8] dark:hover:text-[#8A69FF] px-3.5 py-2 rounded-xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xs hover:shadow-xs transition-all duration-150"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Real-time Typing / Vectorization Indicator */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[85%] animate-fade-in">
                    <div className="w-8 h-8 rounded-lg bg-[#6842E8] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      N
                    </div>
                    <div className="bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] px-4 py-3 rounded-2xl rounded-tl-sm shadow-xs flex items-center gap-1.5 text-xs text-stone-500">
                      <span className="w-2 h-2 rounded-full bg-[#6842E8] animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#6842E8] animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#6842E8] animate-bounce"></span>
                      <span className="ml-2 font-mono text-[11px] text-stone-400">Computing TF-IDF similarity...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Bar Area */}
            <div className="p-4 md:p-6 shrink-0 max-w-3xl w-full mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="bg-white dark:bg-[#201E24] border border-black/[0.1] dark:border-white/[0.1] rounded-2xl shadow-md focus-within:border-[#6842E8] dark:focus-within:border-[#8A69FF] focus-within:ring-2 focus-within:ring-[#6842E8]/20 transition-all p-3 space-y-2"
              >
                <textarea
                  ref={textareaRef}
                  value={inputQuery}
                  onChange={(e) => {
                    setInputQuery(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask a question in plain English (e.g. 'I forgot my password' or 'Where are invoices?')..."
                  className="w-full bg-transparent resize-none outline-none text-xs md:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 max-h-32 leading-relaxed"
                  aria-label="Ask your question"
                />

                <div className="flex items-center justify-between pt-1 border-t border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <span>Press <strong className="font-semibold text-stone-600 dark:text-stone-300">Enter</strong> to send</span>
                    <span aria-hidden="true">·</span>
                    <span><strong className="font-semibold text-stone-600 dark:text-stone-300">Shift + Enter</strong> for line break</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isTyping}
                    className="p-2 bg-[#6842E8] hover:bg-[#5533CC] text-white rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send Question"
                    aria-label="Send Question"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </main>
        )}

        {/* 11-Case Benchmark Suite Tab */}
        {activeTab === 'testbench' && (
          <TestBenchView onRunInChat={handleRunInChatFromBenchmark} />
        )}

        {/* Knowledge Base Catalog Tab */}
        {activeTab === 'knowledge' && (
          <KnowledgeBaseView onAskQuestion={handleRunInChatFromBenchmark} />
        )}

        {/* Code & Architecture Explorer Tab */}
        {activeTab === 'code' && (
          <CodeExplorerView />
        )}
      </div>

      {/* Thresholds Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        highThreshold={highThreshold}
        setHighThreshold={setHighThreshold}
        minThreshold={minThreshold}
        setMinThreshold={setMinThreshold}
      />
    </div>
  );
}

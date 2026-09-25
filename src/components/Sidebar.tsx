import React from 'react';
import { History, Trash2, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  recentQueries: string[];
  onSelectQuery: (q: string) => void;
  onClearHistory: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  recentQueries,
  onSelectQuery,
  onClearHistory,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-72 bg-white dark:bg-[#201E24] border-r border-black/[0.08] dark:border-white/[0.08] flex flex-col p-4 gap-5 z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Knowledge Domains / Categories */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              Knowledge Domains
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => {
                onSelectCategory('All');
                setMobileMenuOpen(false);
              }}
              className={`text-xs font-medium px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-[#EEE9FF] dark:bg-[#2D2545] text-[#6842E8] dark:text-[#8A69FF] font-semibold border border-[#6842E8]/20 dark:border-[#8A69FF]/30'
                  : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`text-xs font-medium px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#EEE9FF] dark:bg-[#2D2545] text-[#6842E8] dark:text-[#8A69FF] font-semibold border border-[#6842E8]/20 dark:border-[#8A69FF]/30'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Search History */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              <History className="w-3.5 h-3.5" />
              <span>Recent Questions</span>
            </div>
            {recentQueries.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-[#6842E8] dark:text-[#8A69FF] hover:underline inline-flex items-center gap-0.5"
                title="Clear Question History"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1">
            {recentQueries.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-stone-500 italic py-3 text-center">
                No recent questions yet
              </p>
            ) : (
              recentQueries.map((query, index) => (
                <button
                  key={`${query}-${index}`}
                  onClick={() => {
                    onSelectQuery(query);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 px-2.5 py-1.5 rounded transition-colors truncate block"
                  title={query}
                >
                  {query}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Local NLP Status & Footer */}
        <div className="pt-3 border-t border-black/[0.08] dark:border-white/[0.08] flex flex-col gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-stone-700 dark:text-stone-200">Local NLP Preprocessor</span>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-tight">
            TF-IDF Vectorizer & Cosine Similarity. No external AI keys or paid APIs required.
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px] text-stone-400">
            <span>CodeAlpha AI Internship</span>
            <span>Task 2</span>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { Search, Tag, MessageSquare } from 'lucide-react';
import { FAQS_DATA, FAQItem } from '../data/faqs';

interface KnowledgeBaseViewProps {
  onAskQuestion: (query: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ onAskQuestion }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const categories = ['All', ...Array.from(new Set(FAQS_DATA.map(f => f.category))).sort()];

  const filteredFaqs = FAQS_DATA.filter(faq => {
    const matchesCat = selectedCat === 'All' || faq.category.toLowerCase() === selectedCat.toLowerCase();
    const query = search.toLowerCase().trim();
    const matchesQuery =
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.keywords.some(k => k.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8F6F1] dark:bg-[#171619] transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            Knowledge Base Catalog
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            55 pre-indexed enterprise FAQ documents loaded into the TF-IDF vector matrix.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across 55 questions, answers, and keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] rounded-lg text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#6842E8]"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] rounded-lg text-stone-700 dark:text-stone-200 focus:outline-none focus:border-[#6842E8]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All 10 Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-stone-400 font-mono">
          Showing {filteredFaqs.length} of {FAQS_DATA.length} entries
        </div>

        {/* FAQ Cards */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] p-4 rounded-xl shadow-xs space-y-2 hover:border-[#6842E8]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold text-stone-400">
                    #{faq.id.toString().padStart(2, '0')}
                  </span>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {faq.question}
                  </h3>
                </div>

                <button
                  onClick={() => onAskQuestion(faq.question)}
                  className="inline-flex items-center gap-1 text-xs text-[#6842E8] dark:text-[#8A69FF] hover:underline shrink-0"
                  title="Ask this question in Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask in Chat</span>
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {faq.answer}
              </p>

              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                <span className="font-medium text-stone-600 dark:text-stone-300">{faq.category}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">Keywords: {faq.keywords.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

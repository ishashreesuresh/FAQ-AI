import React, { useState } from 'react';
import { Copy, Check, RotateCcw, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { ConfusedFaceEmoji } from './ConfusedFaceEmoji';
import { AnimatedReactionEmoji } from './AnimatedReactionEmoji';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSelectSuggestion: (query: string) => void;
  onRetry: (query: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSelectSuggestion,
  onRetry
}) => {
  const [copied, setCopied] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.sender === 'user';
  const match = message.matchData;
  const isMatch = match?.is_match;
  const confidencePct = match ? match.confidence_percentage : 0;

  // Confidence color scale
  let confidenceColor = 'text-stone-500';
  if (confidencePct >= 80) confidenceColor = 'text-emerald-600 dark:text-emerald-400';
  else if (confidencePct >= 50) confidenceColor = 'text-amber-600 dark:text-amber-400';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 max-w-[85%] md:max-w-[75%] ml-auto animate-fade-in">
        <div className="flex flex-col items-end gap-1">
          <div className="bg-[#6842E8] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-xs break-words">
            {message.text}
          </div>
          <span className="text-[11px] text-stone-400 px-1">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-[92%] md:max-w-[85%] animate-fade-in">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-lg bg-[#6842E8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
        N
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] p-4 rounded-2xl rounded-tl-sm shadow-xs flex flex-col gap-3">
          {/* Main Answer Prose with Category/Intent-Specific Animated Emoji Reaction */}
          <div className="text-sm text-stone-900 dark:text-stone-100 leading-relaxed whitespace-pre-wrap flex items-start gap-2.5">
            {(isMatch || message.isWelcome) && (
              <span className="shrink-0 pt-0.5 select-none inline-flex items-center justify-center text-base" aria-hidden="true">
                <AnimatedReactionEmoji
                  category={match?.category}
                  isMatch={isMatch}
                  isWelcome={message.isWelcome}
                  error={match?.error}
                />
              </span>
            )}
            <div className="flex-1 min-w-0">
              {message.text}
            </div>
          </div>

          {/* System Error Status */}
          {match && match.error && (
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
              <AnimatedReactionEmoji error={match.error} />
              <span className="font-medium">{match.error}</span>
            </div>
          )}

          {/* "Why this answer?" Expandable Details (Section 14) */}
          {match && isMatch && (
            <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-lg overflow-hidden bg-stone-50/60 dark:bg-stone-900/40 text-xs">
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="w-full px-3 py-2 text-left flex items-center justify-between text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-[#6842E8] dark:text-[#8A69FF]" />
                  <span>Why this answer? (NLP Breakdown)</span>
                </div>
                {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showWhy && (
                <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2 bg-white dark:bg-[#201E24]">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-stone-400">Matched FAQ:</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200 text-right">
                      {match.matched_question}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-stone-400">Category Domain:</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {match.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-stone-400">Match Confidence:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="emoji-reaction-success select-none text-xs" role="img" aria-label="Success">🎉</span>
                      <span className={`font-mono font-semibold ${confidenceColor}`}>
                        {confidencePct}% match
                      </span>
                      {match.confidence_level === 'medium' && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                          (Possible match)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-stone-400">Cosine Similarity:</span>
                    <span className={`font-mono font-semibold ${confidenceColor}`}>
                      {match.confidence}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-stone-400">Normalized Stems:</span>
                    <span className="font-mono text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px]">
                      {match.query_preprocessed || 'N/A'}
                    </span>
                  </div>

                  {match.alternatives && match.alternatives.length > 0 && (
                    <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
                      <span className="text-stone-400 text-[11px] block mb-1">
                        Alternative Ranked Candidates:
                      </span>
                      <div className="space-y-1">
                        {match.alternatives.map((alt) => (
                          <div
                            key={alt.id}
                            className="flex justify-between items-center text-[11px] text-stone-600 dark:text-stone-300"
                          >
                            <span className="truncate max-w-[280px]">{alt.question}</span>
                            <span className="font-mono text-stone-400 ml-2">
                              {Math.round(alt.score * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Low Confidence Rejection Suggestions */}
          {match && !isMatch && !match.error && (
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <ConfusedFaceEmoji />
                <span className="font-medium text-stone-700 dark:text-stone-300">No reliable match</span>
                {confidencePct > 0 && (
                  <>
                    <span aria-hidden="true" className="opacity-50">·</span>
                    <span className="font-mono text-stone-400">{confidencePct}% similarity</span>
                  </>
                )}
              </div>

              {match.sample_questions && match.sample_questions.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Suggested verified queries:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {match.sample_questions.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectSuggestion(sq)}
                        className="text-left text-xs text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800/80 hover:bg-[#EEE9FF] dark:hover:bg-[#2D2545] hover:text-[#6842E8] dark:hover:text-[#8A69FF] px-3 py-2 rounded-lg transition-all"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Row: Copy, Retry */}
          {!message.isWelcome && (
            <div className="flex items-center gap-3 pt-1 text-xs text-stone-400">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 hover:text-stone-800 dark:hover:text-stone-200 transition-colors py-1"
                title="Copy Answer to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => onRetry(message.text)}
                className="inline-flex items-center gap-1 hover:text-stone-800 dark:hover:text-stone-200 transition-colors py-1"
                title="Ask this question again"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>

        <span className="text-[11px] text-stone-400 px-1">{message.timestamp}</span>
      </div>
    </div>
  );
};

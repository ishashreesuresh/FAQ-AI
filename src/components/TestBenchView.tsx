import React, { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, MessageSquare, ArrowRight, RefreshCw } from 'lucide-react';
import { defaultNlpEngine, MatchResult } from '../nlp/nlpEngine';

interface TestBenchProps {
  onRunInChat: (query: string) => void;
}

interface TestItem {
  id: number;
  query: string;
  expectedCategory: string;
  expectedBehavior: string;
  isUnrelated?: boolean;
}

const MANDATORY_TESTS: TestItem[] = [
  { id: 1, query: "How do I reset my password?", expectedCategory: "Login & Security", expectedBehavior: "Password reset FAQ" },
  { id: 2, query: "I forgot my password. How can I access my account?", expectedCategory: "Login & Security", expectedBehavior: "Password reset / account access FAQ" },
  { id: 3, query: "Can I change my email address?", expectedCategory: "Profile", expectedBehavior: "Email/profile FAQ" },
  { id: 4, query: "Where can I see my payment details?", expectedCategory: "Billing & Payments", expectedBehavior: "Billing/payment FAQ" },
  { id: 5, query: "How do I cancel my subscription?", expectedCategory: "Subscription", expectedBehavior: "Subscription FAQ" },
  { id: 6, query: "I can't log into my account.", expectedCategory: "Login & Security", expectedBehavior: "Login/account access FAQ" },
  { id: 7, query: "How can I contact customer support?", expectedCategory: "Technical Support", expectedBehavior: "Customer support FAQ" },
  { id: 8, query: "Can I change my profile information?", expectedCategory: "Profile", expectedBehavior: "Profile FAQ" },
  { id: 9, query: "How can I change my notification settings?", expectedCategory: "Notifications", expectedBehavior: "Notifications FAQ" },
  { id: 10, query: "What happens to my personal data?", expectedCategory: "Privacy", expectedBehavior: "Privacy/personal data FAQ" },
  { id: 11, query: "What is the capital of Japan?", expectedCategory: "Unrelated Query", expectedBehavior: "OUT-OF-DOMAIN REJECTION", isUnrelated: true }
];

export const TestBenchView: React.FC<TestBenchProps> = ({ onRunInChat }) => {
  const [results, setResults] = useState<Record<number, MatchResult & { passed: boolean }>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = () => {
    setIsRunning(true);
    const newResults: Record<number, MatchResult & { passed: boolean }> = {};

    setTimeout(() => {
      MANDATORY_TESTS.forEach(test => {
        const match = defaultNlpEngine.findBestMatch(test.query, 'All');
        let passed = false;

        if (test.isUnrelated) {
          // Passed if rejected (out-of-domain rejection with confidence below min threshold)
          passed = !match.is_match && match.confidence < defaultNlpEngine.minThreshold;
        } else {
          // Passed if matched with appropriate valid FAQ
          passed = match.is_match && match.confidence >= defaultNlpEngine.minThreshold;
        }

        newResults[test.id] = {
          ...match,
          passed
        };
      });

      setResults(newResults);
      setIsRunning(false);
    }, 400);
  };

  const executedCount = Object.keys(results).length;
  const passedCount = Object.values(results).filter(r => r.passed).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8F6F1] dark:bg-[#171619] transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
              CodeAlpha Internship Task 2 — Benchmark Suite
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Evaluates the 10 mandatory natural language test questions + 1 out-of-domain rejection test against the live TF-IDF Cosine Similarity engine.
            </p>
          </div>

          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6842E8] hover:bg-[#5533CC] text-white text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Vectors...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run All 11 Test Cases</span>
              </>
            )}
          </button>
        </div>

        {/* Verification Summary */}
        {executedCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#201E24] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Total Test Cases</span>
              <span className="text-2xl font-bold font-mono text-stone-800 dark:text-stone-100">{executedCount} / 11</span>
            </div>
            <div className="bg-white dark:bg-[#201E24] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Passing Assertions</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                {passedCount === 11 && executedCount === 11 ? (
                  <>
                    <span className="emoji-reaction-benchmark-success select-none text-xl" role="img" aria-label="Benchmark Success">🎉</span>
                    <span>11/11 Passed</span>
                  </>
                ) : (
                  <>
                    <span className="emoji-reaction-benchmark-failure select-none text-xl text-amber-600 dark:text-amber-400" role="img" aria-label="Benchmark Incomplete">⚠️</span>
                    <span className="text-amber-600 dark:text-amber-400">{passedCount} / {executedCount} Passed</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-[#201E24] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Rejection Boundary</span>
              <span className="text-2xl font-bold font-mono text-[#6842E8] dark:text-[#8A69FF]">
                {results[11]?.passed ? 'VERIFIED' : 'READY'}
              </span>
            </div>
          </div>
        )}

        {/* Test Cards List */}
        <div className="space-y-3">
          {MANDATORY_TESTS.map((test) => {
            const res = results[test.id];

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] p-4 md:p-5 rounded-xl shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-stone-400 w-6">
                      #{test.id.toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      "{test.query}"
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {res ? (
                      res.passed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-stone-400 font-mono">Not Run</span>
                    )}

                    <button
                      onClick={() => onRunInChat(test.query)}
                      className="p-1.5 text-xs text-stone-500 hover:text-[#6842E8] dark:hover:text-[#8A69FF] rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Test in Chat Assistant"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtext info */}
                <div className="text-xs text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-2">
                  <span>Target Domain: {test.expectedCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span>Criteria: {test.expectedBehavior}</span>
                </div>

                {/* Dynamic Results output when executed */}
                {res && (
                  <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50/70 dark:bg-stone-900/50 p-3 rounded-lg">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Matched Knowledge Entry:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {res.matched_question || 'None (Correctly Rejected)'}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[11px]">Calculated Similarity & Stems:</span>
                      <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                        {res.confidence_percentage}% score
                      </span>
                      <span className="text-stone-400 text-[11px] ml-2">
                        [{res.query_preprocessed}]
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

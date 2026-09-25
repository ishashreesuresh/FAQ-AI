import React from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  highThreshold: number;
  setHighThreshold: (val: number) => void;
  minThreshold: number;
  setMinThreshold: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  highThreshold,
  setHighThreshold,
  minThreshold,
  setMinThreshold
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    setHighThreshold(0.65);
    setMinThreshold(0.40);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#201E24] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#6842E8] dark:text-[#8A69FF]" />
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              NLP Confidence Thresholds
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Configure the Cosine Similarity decision boundaries used by the NLP matching engine to categorize queries into High Confidence, Possible Match, or Fallback Rejection.
        </p>

        <div className="space-y-4">
          {/* High Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-stone-700 dark:text-stone-300">
                High Confidence Threshold
              </span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.round(highThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.55"
              max="0.95"
              step="0.05"
              value={highThreshold}
              onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#6842E8]"
            />
            <span className="text-[11px] text-stone-400 block">
              Queries scoring above this percentage are delivered as verified definitive matches.
            </span>
          </div>

          {/* Min Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-stone-700 dark:text-stone-300">
                Minimum Acceptance Threshold
              </span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {Math.round(minThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.75"
              step="0.05"
              value={minThreshold}
              onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#6842E8]"
            />
            <span className="text-[11px] text-stone-400 block">
              Queries scoring below this limit are rejected to prevent hallucination or erroneous answers.
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults (65% / 40%)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#6842E8] hover:bg-[#5533CC] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

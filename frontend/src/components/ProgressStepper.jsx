import React from 'react';
import { Check, Loader2 } from 'lucide-react';

const STAGES = [
  'Uploading',
  'Extracting',
  'OCR',
  'Detecting clauses',
  'Retrieving context',
  'Analyzing risks',
  'Generating report'
];

export default function ProgressStepper({ currentStep = 0 }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={stage} className="flex-1 flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[10px] mt-2 text-center font-medium ${
                  isCurrent ? 'text-sky-600 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

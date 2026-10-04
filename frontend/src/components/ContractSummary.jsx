import React from 'react';
import { FileCheck } from 'lucide-react';

export default function ContractSummary({ summary, filename }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">CONTRACT SUMMARY</h2>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
        {summary || `This agreement is for ${filename}. The analysis has extracted key clauses and evaluated risk exposures across financial, termination, and liability provisions.`}
      </p>
    </div>
  );
}

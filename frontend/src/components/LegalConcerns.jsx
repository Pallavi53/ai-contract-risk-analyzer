import React from 'react';
import { AlertCircle, FileText, Bookmark } from 'lucide-react';

export default function LegalConcerns({ risks }) {
  if (!risks || risks.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        No high or moderate legal concerns detected in this contract.
      </div>
    );
  }

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">LEGAL CONCERNS ({risks.length})</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {risks.map((risk, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase border ${getSeverityBadge(risk.severity)}`}>
                  {risk.severity}
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {risk.risk_type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-slate-300 font-mono">
                  Page {risk.page_number}
                </span>
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-blue-400 font-semibold">
                  +{risk.score_contribution || risk.risk_score} pts
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-3 leading-relaxed">
              <strong className="text-slate-400 font-medium">Concern: </strong> {risk.reason}
            </p>

            {risk.evidence && (
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 font-mono text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-sans">
                    Exact Evidence Quote from Document (Page {risk.page_number})
                  </span>
                  "{risk.evidence}"
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, Info } from 'lucide-react';

export default function RiskGauge({ score, riskLevel }) {
  const getBadgeDetails = (level) => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          icon: <AlertTriangle className="w-8 h-8 text-yellow-400" />
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          icon: <AlertTriangle className="w-8 h-8 text-orange-400" />
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: <AlertOctagon className="w-8 h-8 text-red-400" />
        };
    }
  };

  const badge = getBadgeDetails(riskLevel);

  return (
    <div className={`p-6 rounded-xl border ${badge.bg} ${badge.border} flex flex-col md:flex-row items-center justify-between gap-6`}>
      <div className="flex items-center gap-5">
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center">
          {badge.icon}
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
            OVERALL RISK SCORE
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-extrabold text-white">{score} <span className="text-xl text-slate-400 font-normal">/ 100</span></span>
            <span className={`px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${badge.bg} ${badge.text} border ${badge.border}`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <span>
          Risk score is a project-defined analytical heuristic and does not constitute legal advice.
        </span>
      </div>
    </div>
  );
}

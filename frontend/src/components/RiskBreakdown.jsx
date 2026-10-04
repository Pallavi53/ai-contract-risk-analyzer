import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function RiskBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const items = [
    { label: 'Financial Exposure', value: breakdown.financial_score || 0, max: 25 },
    { label: 'Termination', value: breakdown.termination_score || 0, max: 15 },
    { label: 'Liability & Indemnification', value: breakdown.liability_score || 0, max: 20 },
    { label: 'Intellectual Property', value: breakdown.ip_score || 0, max: 10 },
    { label: 'Restrictive Covenants', value: breakdown.restrictions_score || 0, max: 10 },
    { label: 'Data Protection', value: breakdown.data_score || 0, max: 10 },
    { label: 'Other / Unusual Terms', value: breakdown.other_score || 0, max: 10 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold text-white">RISK BREAKDOWN BY CATEGORY</h2>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const pct = Math.round((item.value / item.max) * 100);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{item.label}</span>
                <span className="text-slate-400">{item.value} / {item.max} pts</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    pct > 70 ? 'bg-red-500' : pct > 40 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

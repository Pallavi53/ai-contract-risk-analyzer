import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import { ChevronRight, FileText, AlertTriangle, Info } from 'lucide-react';

export default function ClauseViewer({ findings, selectedFinding, onSelectFinding }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = filterSeverity === 'ALL'
    ? findings
    : findings.filter(f => f.severity === filterSeverity);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="h-4 w-4 text-sky-600" />
          Detected Risk Findings ({findings.length})
        </h3>
        <div className="flex space-x-1 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-1 rounded font-medium transition ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
        {filtered.map((item, idx) => {
          const isSelected = selectedFinding && selectedFinding.evidence === item.evidence;
          return (
            <div
              key={idx}
              onClick={() => onSelectFinding(item)}
              className={`p-4 cursor-pointer transition ${
                isSelected ? 'bg-sky-50 border-l-4 border-sky-600' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <RiskBadge severity={item.severity} />
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {item.clause_type}
                    </span>
                    <span className="text-xs text-slate-400">Page {item.page}</span>
                  </div>
                  <h4 className="mt-1 text-sm font-semibold text-slate-900">
                    {item.risk_type}
                  </h4>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-400 ${isSelected ? 'text-sky-600' : ''}`} />
              </div>

              <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                {item.reason}
              </p>

              <div className="mt-2 bg-slate-100 p-2 rounded text-xs font-mono text-slate-700 border-l-2 border-slate-400">
                "{item.evidence}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

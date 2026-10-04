import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { GitCompare, PlusCircle, MinusCircle, Edit3, ArrowRight, ShieldAlert } from 'lucide-react';

export default function VersionCompare() {
  const { id } = useParams();
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState(null);

  const runComparison = async () => {
    setComparing(true);
    try {
      const res = await api.post('/compare', {
        version1Id: 'ver_1',
        version2Id: 'ver_2'
      });
      setComparison(res.data.data.comparison);
    } catch (err) {
      console.error(err);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
            <GitCompare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Contract Version Comparison</h1>
            <p className="text-xs text-slate-500">Side-by-side diff tracking added, removed, and modified clauses & risk score impact</p>
          </div>
        </div>

        <button
          onClick={runComparison}
          disabled={comparing}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow disabled:opacity-50"
        >
          {comparing ? 'Comparing...' : 'Run Version 1 vs Version 2 Comparison'}
        </button>
      </div>

      {comparison && (
        <div className="space-y-6">
          
          {/* Risk Impact Metric Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase">Version 2 Net Risk Score Impact</span>
              <p className="text-2xl font-extrabold mt-1 text-rose-400">+ {comparison.risk_score_delta} Points Risk Increase</p>
            </div>
            <ShieldAlert className="h-10 w-10 text-rose-400" />
          </div>

          {/* Changes Diff List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {comparison.changes.map((change, idx) => (
              <div key={idx} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {change.type === 'ADDED' && <PlusCircle className="h-5 w-5 text-emerald-600" />}
                    {change.type === 'REMOVED' && <MinusCircle className="h-5 w-5 text-rose-600" />}
                    {change.type === 'MODIFIED' && <Edit3 className="h-5 w-5 text-amber-600" />}
                    <span className="font-bold text-sm text-slate-900">{change.clause_type}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                    {change.risk_impact}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">{change.details}</p>

                {/* Diff Comparison Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                  <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200 text-rose-900">
                    <span className="font-bold text-[10px] text-rose-600 uppercase block mb-1">VERSION 1 (Original)</span>
                    <p>{change.version_1_text || '(Section was not present)'}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 text-emerald-900">
                    <span className="font-bold text-[10px] text-emerald-600 uppercase block mb-1">VERSION 2 (Revised)</span>
                    <p>{change.version_2_text || '(Section removed)'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {!comparison && (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm text-xs text-slate-400">
          Click "Run Version 1 vs Version 2 Comparison" above to perform automated diff and risk delta evaluation.
        </div>
      )}

    </div>
  );
}

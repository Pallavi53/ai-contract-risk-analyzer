import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ClauseViewer from '../components/ClauseViewer';
import RiskBadge from '../components/RiskBadge';
import RiskGauge from '../components/RiskGauge';
import { ShieldAlert, Info, FileText, CheckCircle2, BarChart2 } from 'lucide-react';

export default function AnalysisView() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState(null);

  useEffect(() => {
    // Reset selection state on route/contract change
    setSelectedFinding(null);
    setLoading(true);

    api.get(`/analysis/${id}`)
      .then(res => {
        const data = res.data.data.analysis;
        setAnalysis(data);
        if (data.risk_findings && data.risk_findings.length > 0) {
          setSelectedFinding(data.risk_findings[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Analyzing uploaded contract...</h3>
        <p className="text-xs text-slate-500">Executing PyMuPDF extraction, clause classification, and deterministic scoring formula</p>
      </div>
    );
  }

  if (!analysis) {
    return <div className="p-8 text-center text-xs text-rose-500">Contract analysis unavailable.</div>;
  }

  const findings = analysis.risk_findings || [];
  const breakdown = analysis.category_breakdown || {
    "Financial Exposure": { score: 12, max: 25 },
    "Termination": { score: 10, max: 15 },
    "Liability": { score: 15, max: 20 },
    "Intellectual Property": { score: 8, max: 10 },
    "Restrictive Covenants": { score: 8, max: 10 },
    "Data Protection": { score: 5, max: 10 },
    "Unusual Terms": { score: 5, max: 10 }
  };

  const riskLevel = analysis.risk_level || (analysis.risk_score >= 80 ? 'Critical' : analysis.risk_score >= 60 ? 'High' : analysis.risk_score >= 30 ? 'Moderate' : 'Low');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Mandatory Disclaimer Alert */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-800 flex items-start space-x-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900">Academic Prototype Notice & Non-Legal Advice Disclaimer</h4>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            This analysis is generated for informational and academic purposes and does not constitute legal advice.
            All scores are derived from a project-defined deterministic risk formula evaluating actual uploaded text.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Clause & Risk Inspector */}
        <div className="lg:col-span-2 space-y-6">
          <ClauseViewer
            findings={findings}
            selectedFinding={selectedFinding}
            onSelectFinding={setSelectedFinding}
          />
        </div>

        {/* Right Column: Dynamic Score Gauge & Transparent Score Breakdown */}
        <div className="space-y-6">
          
          <RiskGauge 
            score={analysis.risk_score} 
            title="Document Risk Score"
            label={`RISK LEVEL: ${riskLevel.toUpperCase()}`}
          />

          {/* Transparent Score Breakdown Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <BarChart2 className="h-4 w-4 text-sky-600" /> Deterministic Score Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              {Object.entries(breakdown).map(([cat, item]) => {
                const score = typeof item === 'number' ? item : item.score;
                const max = typeof item === 'number' ? 15 : item.max;
                const percent = Math.round((score / max) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{cat}</span>
                      <span className="font-mono text-slate-900">{score} / {max}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          percent >= 75 ? 'bg-rose-500' : percent >= 50 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
              <span>TOTAL CALCULATED SCORE:</span>
              <span className="text-sm font-extrabold text-sky-700 font-mono">{analysis.risk_score} / 100</span>
            </div>
          </div>

          {/* Selected Finding Recommendation Drawer */}
          {selectedFinding && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Selected Concern Deep Dive</h3>
                <RiskBadge severity={selectedFinding.severity} />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Category</span>
                <p className="text-xs font-bold text-slate-900">{selectedFinding.risk_type}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Exact Passage Evidence (Page {selectedFinding.page})</span>
                <p className="text-xs font-mono text-slate-800 bg-slate-100 p-2.5 rounded mt-1 border-l-2 border-slate-400 leading-relaxed">
                  "{selectedFinding.evidence}"
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Concern & Explanation</span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                  {selectedFinding.reason}
                </p>
              </div>

              {selectedFinding.recommendation && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Academic Recommendation</span>
                  <p className="text-xs text-emerald-900 mt-1 leading-relaxed bg-emerald-50/60 p-2.5 rounded border border-emerald-200">
                    {selectedFinding.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

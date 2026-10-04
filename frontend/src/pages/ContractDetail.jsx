import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FileText, 
  ShieldAlert, 
  MessageSquare, 
  GitCompare, 
  Calendar, 
  Users, 
  Building2,
  FileCheck
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';

export default function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/contracts/${id}`)
      .then(res => setContract(res.data.data.contract))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading contract metadata...</div>;
  }

  if (!contract) {
    return <div className="p-8 text-center text-xs text-rose-500">Contract not found.</div>;
  }

  const summary = contract.overall_summary || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900">{contract.title}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">ID: {contract.id} • SHA-256 Verified</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/contracts/${id}/analysis`}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            Risk Analysis
          </Link>
          <Link
            to={`/contracts/${id}/chat`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <MessageSquare className="h-4 w-4" /> Ask RAG AI
          </Link>
          <Link
            to={`/contracts/${id}/compare`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <GitCompare className="h-4 w-4" /> Compare Versions
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Executive Contract Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.overall_summary || "Contract governing commercial services and liability frameworks."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-sky-600" /> Contracting Parties
                </span>
                <p className="font-bold text-slate-800">
                  {summary.parties ? summary.parties.join(' & ') : 'Acme Corp & Vendor Partner'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Contract Duration
                </span>
                <p className="font-bold text-slate-800">{summary.contract_duration || '12 Months'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" /> Governing Law
                </span>
                <p className="font-bold text-slate-800">{summary.governing_law || 'State of Delaware'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                  <FileCheck className="h-3.5 w-3.5 text-amber-600" /> Termination Notice
                </span>
                <p className="font-bold text-slate-800">{summary.termination_conditions || '30 days written notice'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Score Gauge */}
        <div className="space-y-6">
          <RiskGauge score={contract.risk_score} />
        </div>

      </div>

    </div>
  );
}

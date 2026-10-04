import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, ShieldAlert, LogOut } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import RiskBreakdown from '../components/RiskBreakdown';
import LegalConcerns from '../components/LegalConcerns';
import ContractSummary from '../components/ContractSummary';
import RagChat from '../components/RagChat';
import VersionCompare from '../components/VersionCompare';

export default function Dashboard({ user, onLogout }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [error, setError] = useState('');

  // Current analysis state (must reset completely per Section 21)
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'compare'

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF document.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('PDF file size exceeds 20MB limit.');
        setSelectedFile(null);
        return;
      }
      setError('');
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    // SECTION 21: CLEAR PREVIOUS STATE COMPLETELY
    setCurrentAnalysis(null);
    setError('');
    setAnalyzing(true);

    try {
      // Step 1: Uploading
      setProgressStep('Uploading contract PDF...');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await axios.post('/api/contracts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const contractId = uploadRes.data.contract_id;

      // Step 2: Extracting
      setProgressStep('Extracting PDF text page-by-page & running OCR if required...');

      // Step 3 & 4: Analyzing clauses & risks
      setTimeout(() => setProgressStep('Extracting legal clauses & detecting risks...'), 1000);
      setTimeout(() => setProgressStep('Calculating deterministic risk score & running validation...'), 2500);
      setTimeout(() => setProgressStep('Generating report & isolated RAG embeddings...'), 4000);

      const analyzeRes = await axios.post(`/api/contracts/${contractId}/analyze`);

      // Step 5: Completed
      setProgressStep('Completed.');
      setCurrentAnalysis(analyzeRes.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.error || 'Contract analysis failed. Please check the backend and AI services.');
    } finally {
      setAnalyzing(false);
      setProgressStep('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Contract Risk Analyzer</h1>
            <p className="text-xs text-slate-400">Academic Major Project - Document-Specific Risk Analysis Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Logged in as</span>
            <span className="text-xs font-semibold text-blue-300">{user?.email || 'admin@contractanalyzer.com'}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'analysis'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Contract Analysis
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'compare'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Compare Contract Versions
          </button>
        </div>

        {activeTab === 'compare' ? (
          <VersionCompare />
        ) : (
          <>
            {/* Upload Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                UPLOAD CONTRACT FOR ANALYSIS
              </h2>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex-1 w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-950 border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl cursor-pointer transition">
                    <Upload className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-slate-300 font-medium">
                      {selectedFile ? selectedFile.name : 'Choose PDF Contract (Max 20MB)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={analyzing || !selectedFile}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    <FileText className="w-5 h-5" />
                    <span>{analyzing ? 'ANALYZING...' : 'ANALYZE CONTRACT'}</span>
                  </button>
                </div>

                {selectedFile && (
                  <p className="text-xs text-slate-400">
                    Selected file: <code className="text-blue-300">{selectedFile.name}</code> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </form>

              {/* Real-time Progress Steps */}
              {analyzing && (
                <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-3 text-blue-400 text-sm font-medium">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
                    <span>{progressStep}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results Display */}
            {currentAnalysis && (
              <div className="space-y-8">
                {/* Contract Meta & Risk Gauge */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono text-blue-400 block">ID: {currentAnalysis.contract_id}</span>
                      <h2 className="text-xl font-bold text-white mt-0.5">{currentAnalysis.filename}</h2>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-md font-mono">
                        Clauses: {currentAnalysis.clauses?.length || 0}
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-md font-mono">
                        Risks: {currentAnalysis.risks?.length || 0}
                      </span>
                    </div>
                  </div>

                  <RiskGauge
                    score={currentAnalysis.overall_score}
                    riskLevel={currentAnalysis.risk_level}
                  />
                </div>

                {/* Risk Breakdown & Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <RiskBreakdown breakdown={currentAnalysis.breakdown} />
                  <ContractSummary summary={currentAnalysis.summary} filename={currentAnalysis.filename} />
                </div>

                {/* Legal Concerns List */}
                <LegalConcerns risks={currentAnalysis.risks} />

                {/* Document-Isolated RAG Chat */}
                <RagChat contractId={currentAnalysis.contract_id} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Legal Disclaimer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        Important: This tool provides automated contract analysis for educational and informational purposes. It does not provide legal advice and should not replace review by a qualified legal professional.
      </footer>
    </div>
  );
}

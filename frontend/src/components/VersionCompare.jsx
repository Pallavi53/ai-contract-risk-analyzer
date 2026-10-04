import React, { useState } from 'react';
import axios from 'axios';
import { GitCompare, Upload, ArrowRight, AlertTriangle } from 'lucide-react';

export default function VersionCompare() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!file1 || !file2) {
      setError('Please select both Version 1 and Version 2 PDF files.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const res = await axios.post('/api/contracts/compare', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Version comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">COMPARE CONTRACT VERSIONS</h2>
      </div>

      <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            VERSION 1 (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile1(e.target.files[0])}
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
          />
          {file1 && <p className="text-xs text-blue-400 mt-2 truncate">{file1.name}</p>}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            VERSION 2 (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile2(e.target.files[0])}
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
          />
          {file2 && <p className="text-xs text-blue-400 mt-2 truncate">{file2.name}</p>}
        </div>

        <div className="md:col-span-2">
          {error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file1 || !file2}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
          >
            {loading ? 'ANALYZING & COMPARING...' : 'COMPARE CONTRACT VERSIONS'}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Version 1 Score</span>
              <span className="text-xl font-bold text-white">{result.v1_score} / 100</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 hidden md:block" />
            <div>
              <span className="text-xs text-slate-400 block">Version 2 Score</span>
              <span className="text-xl font-bold text-white">{result.v2_score} / 100</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="p-3">CLAUSE</th>
                  <th className="p-3">VERSION 1</th>
                  <th className="p-3">VERSION 2</th>
                  <th className="p-3">CHANGE</th>
                  <th className="p-3">RISK IMPACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {result.comparisons.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-950/50">
                    <td className="p-3 font-semibold text-blue-400">{row.clause}</td>
                    <td className="p-3 text-slate-300 font-mono text-[11px] max-w-xs">{row.version_1}</td>
                    <td className="p-3 text-slate-300 font-mono text-[11px] max-w-xs">{row.version_2}</td>
                    <td className="p-3 text-slate-200">{row.change}</td>
                    <td className="p-3 text-amber-300 font-medium">{row.risk_impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

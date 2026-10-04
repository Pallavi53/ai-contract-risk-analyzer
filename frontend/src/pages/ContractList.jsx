import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Search, 
  X
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FileUploader from '../components/FileUploader';
import ProgressStepper from '../components/ProgressStepper';

export default function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const fetchContracts = async () => {
    try {
      const res = await api.get('/contracts');
      setContracts(res.data.data.contracts);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadError('');
    setUploadStep(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const interval = setInterval(() => {
        setUploadStep(prev => (prev < 6 ? prev + 1 : prev));
      }, 400);

      const res = await api.post('/contracts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(interval);
      setUploadStep(6);

      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
        fetchContracts();
      }, 500);
    } catch (err) {
      setIsUploading(false);
      setUploadError(err.response?.data?.message || 'Upload failed.');
    }
  };

  const filteredContracts = contracts.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contract Repository</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and analyze uploaded organization contracts</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-2"
        >
          <Upload className="h-4 w-4" /> Upload Contract
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contracts by title..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
            <tr>
              <th className="p-4">Contract Title</th>
              <th className="p-4">Format</th>
              <th className="p-4">Risk Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Uploaded Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContracts.map((c) => {
              const score = parseFloat(c.risk_score || 0);
              let sev = 'LOW';
              if (score >= 80) sev = 'CRITICAL';
              else if (score >= 60) sev = 'HIGH';
              else if (score >= 30) sev = 'MEDIUM';
              else sev = 'LOW';

              return (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-semibold text-slate-900">
                    <Link to={`/contracts/${c.id}`} className="hover:text-sky-600 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-sky-600 shrink-0" />
                      {c.title}
                    </Link>
                  </td>
                  <td className="p-4 uppercase font-mono">{c.file_type}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900">{score.toFixed(1)}</span>
                      <RiskBadge severity={sev} />
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                      COMPLETED
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/contracts/${c.id}/analysis`}
                      className="px-3 py-1.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition"
                    >
                      Analysis
                    </Link>
                    <Link
                      to={`/contracts/${c.id}/chat`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition"
                    >
                      Chat
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Upload Modal Drawer */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => !isUploading && setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload Contract Document</h3>
            <p className="text-xs text-slate-500 mb-6">Select PDF or DOCX file for explainable AI risk analysis</p>

            <FileUploader onFileSelect={handleFileUpload} isUploading={isUploading} error={uploadError} />

            {isUploading && (
              <div className="mt-6">
                <ProgressStepper currentStep={uploadStep} />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

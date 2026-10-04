import React, { useState } from 'react';
import { UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FileUploader({ onFileSelect, isUploading, error }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSet(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSet(e.target.files[0]);
    }
  };

  const validateAndSet = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      alert('Only PDF and DOCX files are allowed.');
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
          dragOver ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input
          type="file"
          id="contract-file-input"
          accept=".pdf,.docx"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
        <label htmlFor="contract-file-input" className="cursor-pointer block">
          <div className="mx-auto w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to upload or drag & drop contract
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF (text & scanned) and DOCX (Max size 25MB)
          </p>
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 bg-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center space-x-2">
            <File className="h-4 w-4 text-sky-600" />
            <span className="font-medium">{selectedFile.name}</span>
            <span className="text-slate-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

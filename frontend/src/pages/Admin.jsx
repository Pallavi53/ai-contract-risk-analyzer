import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sliders, Activity, ShieldCheck, FileSpreadsheet, Users } from 'lucide-react';

export default function Admin() {
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/audit'),
      api.get('/admin/health')
    ])
      .then(([aRes, hRes]) => {
        setLogs(aRes.data.data.logs);
        setHealth(hRes.data.data.healthStatus);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Administration & Audit Console</h1>
        <p className="text-xs text-slate-500">Monitor service health, user access roles, and security audit trail</p>
      </div>

      {/* Health Checks */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {health && Object.entries(health).filter(([k]) => k !== 'timestamp').map(([service, status]) => (
          <div key={service} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{service}</span>
              <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{status}</p>
            </div>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
        ))}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-sky-600" /> System Audit Trail ({logs.length} events)
          </h3>
        </div>

        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource</th>
              <th className="p-3">User ID</th>
              <th className="p-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3 font-bold text-sky-700">{log.action}</td>
                <td className="p-3 text-slate-800">{log.resource_type} ({log.resource_id || 'N/A'})</td>
                <td className="p-3 text-slate-600">{log.user_id}</td>
                <td className="p-3 text-slate-500">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl space-y-6">
      
      <div>
        <h1 className="text-xl font-bold text-slate-900">User Settings & Profile</h1>
        <p className="text-xs text-slate-500">View user account information and active role permissions</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="h-4 w-4 text-sky-600" /> User Profile Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-400 uppercase">Full Name</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{user?.name}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase">Email Address</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase">Role Authorization</span>
            <p className="font-bold text-sky-600 text-sm mt-0.5">{user?.role}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase">Organization ID</span>
            <p className="font-mono text-slate-600 text-xs mt-0.5">{user?.organization_id}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

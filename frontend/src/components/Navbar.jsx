import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-sky-500 p-2 rounded-lg text-slate-950 font-bold">
                <Shield className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                AI Contract Risk Analyzer
              </span>
            </Link>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
              Research Prototype
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-200">{user.name}</p>
                  <p className="text-xs text-sky-400">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

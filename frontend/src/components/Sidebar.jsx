import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Contract Repository', path: '/contracts', icon: FileText },
    { label: 'Account Profile', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-sky-600/20 text-sky-400 border-l-4 border-sky-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-semibold text-amber-400 mb-1 flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            Notice
          </p>
          <p className="leading-relaxed">
            This analysis is generated for informational and academic purposes and does not constitute legal advice.
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-600 text-center pt-4 border-t border-slate-800 font-mono">
        v1.0.0 • Academic Major Project
      </div>
    </aside>
  );
}

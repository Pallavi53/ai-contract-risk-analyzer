import React from 'react';

export default function RiskBadge({ severity }) {
  const sev = (severity || 'LOW').toUpperCase();

  const styles = {
    CRITICAL: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
    HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    MEDIUM: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[sev] || styles.LOW
      }`}
    >
      {sev}
    </span>
  );
}

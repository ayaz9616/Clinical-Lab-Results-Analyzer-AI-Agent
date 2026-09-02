import React from 'react';
import { PieChart } from 'lucide-react';

export default function AnalysisSummary({ data }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PieChart size={18} color="var(--accent-secondary)" />
        Analysis Summary
      </h2>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {!data ? 'Awaiting data ingestion...' : `Ready to analyze ${data.length} records.`}
      </div>
    </div>
  );
}

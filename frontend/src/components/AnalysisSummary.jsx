import React from 'react';
import { PieChart } from 'lucide-react';

export default function AnalysisSummary({ data, results }) {
  if (!results) {
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

  const { total, critical, warning, normal } = results.summary;
  
  // Create a tiny visual bar chart
  const critPct = (critical / total) * 100;
  const warnPct = (warning / total) * 100;
  const normPct = (normal / total) * 100;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PieChart size={18} color="var(--accent-secondary)" />
        Analysis Summary
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-critical)' }}>{critical}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Critical</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>{warning}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Warning</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-normal)' }}>{normal}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Normal</div>
        </div>
      </div>
      
      {/* Visual Distribution Bar */}
      <div style={{ height: '8px', borderRadius: '4px', display: 'flex', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ width: `${critPct}%`, background: 'var(--color-critical)' }} />
        <div style={{ width: `${warnPct}%`, background: 'var(--color-warning)' }} />
        <div style={{ width: `${normPct}%`, background: 'var(--color-normal)' }} />
      </div>
    </div>
  );
}

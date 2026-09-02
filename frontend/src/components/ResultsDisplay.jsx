import React from 'react';
import { ListFilter } from 'lucide-react';

export default function ResultsDisplay() {
  return (
    <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ListFilter size={18} color="var(--accent-secondary)" />
        Processed Results
      </h2>
      <div style={{ 
        flex: 1,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        border: '1px dashed var(--surface-border)',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        Awaiting data ingestion...
      </div>
    </div>
  );
}

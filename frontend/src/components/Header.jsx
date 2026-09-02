import React from 'react';
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Activity size={24} color="var(--accent-primary)" />
          <div>
            <h1 className="header-title">Clinical Lab Intelligence</h1>
            <div className="header-subtitle">AI-powered laboratory result analysis</div>
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', maxWidth: '500px', textAlign: 'right', fontStyle: 'italic', paddingLeft: '16px' }}>
          This application is for informational and demonstration purposes only. It does not provide medical diagnosis or treatment recommendations and is not a substitute for evaluation by a qualified healthcare professional. Laboratory results should be interpreted in the context of the patient's clinical history and laboratory-specific reference ranges.
        </div>
      </div>
    </header>
  );
}

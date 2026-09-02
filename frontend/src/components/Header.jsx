import React from 'react';
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-area">
      <Activity size={24} color="var(--accent-primary)" />
      <div>
        <h1 className="header-title">Clinical Lab Intelligence</h1>
        <div className="header-subtitle">AI-powered laboratory result analysis</div>
      </div>
    </header>
  );
}

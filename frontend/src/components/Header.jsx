import { Activity, BookOpen, LayoutTemplate } from 'lucide-react';

export default function Header({ currentView, setCurrentView }) {
  return (
    <header className="header-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Activity size={24} color="var(--accent-primary)" />
          <div>
            <h1 className="header-title">Clinical Lab Intelligence {currentView === 'docs' && '/ Docs'}</h1>
            {currentView !== 'docs' && <div className="header-subtitle">AI-powered laboratory result analysis</div>}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrentView(currentView === 'docs' ? 'app' : 'docs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--surface-active)',
              color: 'var(--text-primary)',
              border: '1px solid var(--surface-border)',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            {currentView === 'docs' ? (
              <><LayoutTemplate size={16} /> Dashboard</>
            ) : (
              <><BookOpen size={16} /> Docs</>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

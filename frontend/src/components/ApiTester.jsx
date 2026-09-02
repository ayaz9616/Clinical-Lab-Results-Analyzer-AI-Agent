import React from 'react';
import { KeyRound } from 'lucide-react';

export default function ApiTester({ userApiKey, setApiKey }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <KeyRound size={18} color="var(--accent-secondary)" />
        Bring Your Own Key (BYOK)
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
          My server's free tier Gemini quota may run out during evaluation. To guarantee execution, you can securely provide your own API key below. This key will be used for your analysis requests and is not stored on the server.
        </p>
        <input 
          type="password" 
          placeholder="Enter Gemini API Key..." 
          value={userApiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--surface-border)',
            borderRadius: '6px',
            padding: '10px 12px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            width: '100%'
          }}
        />
      </div>
    </div>
  );
}

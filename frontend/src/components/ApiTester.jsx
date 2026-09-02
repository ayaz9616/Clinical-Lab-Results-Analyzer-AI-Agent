import React, { useState } from 'react';
import { KeyRound, Send } from 'lucide-react';

export default function ApiTester() {
  const [apiKey, setApiKey] = useState('');
  const [question, setQuestion] = useState('Say hello to the clinical lab agent!');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!apiKey) {
      setResponse("Please enter an API key.");
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const res = await fetch('http://localhost:8000/test_llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, question: question })
      });
      
      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <KeyRound size={18} color="var(--accent-secondary)" />
        API Key Tester
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="Enter Gemini API Key..." 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--surface-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem'
          }}
        />
        
        <input 
          type="text" 
          placeholder="Test question..." 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--surface-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem'
          }}
        />
        
        <button 
          className="btn-primary" 
          onClick={handleTest} 
          disabled={isLoading || !apiKey}
          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
        >
          {isLoading ? 'Testing...' : 'Test Key'}
        </button>
        
        {response && (
          <div style={{ 
            marginTop: '8px', 
            padding: '12px', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: response.startsWith('Error') ? 'var(--color-critical)' : 'var(--text-primary)',
            maxHeight: '100px',
            overflowY: 'auto'
          }}>
            {response}
          </div>
        )}
      </div>
    </div>
  );
}

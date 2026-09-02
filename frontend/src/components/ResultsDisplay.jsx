import React, { useState } from 'react';
import { ListFilter, ChevronDown, ChevronRight, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const ResultCard = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  
  const isCritical = result.classification === 'CRITICAL';
  const isWarning = result.classification === 'WARNING';
  
  let borderColor = 'var(--surface-border)';
  let icon = <CheckCircle size={18} color="var(--color-normal)" />;
  let color = 'var(--color-normal)';
  
  if (isCritical) {
    borderColor = 'var(--color-critical)';
    icon = <AlertCircle size={18} color="var(--color-critical)" />;
    color = 'var(--color-critical)';
  } else if (isWarning) {
    borderColor = 'var(--color-warning)';
    icon = <AlertTriangle size={18} color="var(--color-warning)" />;
    color = 'var(--color-warning)';
  }

  const refRangeStr = result.reference_range 
    ? (result.reference_range.text_value || `${result.reference_range.low} - ${result.reference_range.high}`)
    : 'N/A';

  return (
    <div style={{ 
      border: `1px solid ${borderColor}`,
      borderRadius: '8px',
      background: isCritical ? 'rgba(239, 68, 68, 0.05)' : isWarning ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.02)',
      marginBottom: '12px',
      overflow: 'hidden'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon}
          <div>
            <div style={{ fontWeight: 600 }}>{result.test_name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Result: <span style={{ color: 'var(--text-primary)' }}>{result.value} {result.unit}</span> | Ref: {refRangeStr}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color }}>
            {result.classification}
          </span>
          {expanded ? <ChevronDown size={20} color="var(--text-secondary)" /> : <ChevronRight size={20} color="var(--text-secondary)" />}
        </div>
      </div>
      
      {expanded && (
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--accent-secondary)', marginBottom: '8px' }}>Clinical Explanation</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
            {result.explanation}
          </p>
          
          <h4 style={{ fontSize: '0.875rem', color: 'var(--accent-secondary)', marginBottom: '8px' }}>Recommended Next Steps</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {result.next_steps?.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function ResultsDisplay({ results }) {
  const [filter, setFilter] = useState('ALL');

  if (!results) {
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

  const filteredResults = results.results.filter(r => filter === 'ALL' || r.classification === filter);

  return (
    <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <ListFilter size={18} color="var(--accent-secondary)" />
          Processed Results
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'CRITICAL', 'WARNING', 'NORMAL'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid var(--surface-border)',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        {filteredResults.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px', fontSize: '0.875rem' }}>
            No results match this filter.
          </div>
        ) : (
          filteredResults.map((result, idx) => (
            <ResultCard key={idx} result={result} />
          ))
        )}
      </div>
    </div>
  );
}

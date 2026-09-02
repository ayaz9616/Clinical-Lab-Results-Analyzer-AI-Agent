import React, { useState, useRef } from 'react';
import { FileUp, Database, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function LabInput({ onDataLoaded, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileStatus, setFileStatus] = useState('idle'); // idle, loaded, error
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedLabs, setParsedLabs] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file || (file.type !== "text/csv" && !file.name.endsWith(".csv"))) {
      setFileStatus('error');
      setErrorMessage('Please upload a valid CSV file.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        if (data.length === 0) {
          setFileStatus('error');
          setErrorMessage('CSV file is empty.');
          return;
        }

        const requiredCols = ['Test Adı', 'Sonuç', 'Birim'];
        const hasCols = requiredCols.every(col => Object.keys(data[0]).includes(col));
        
        if (!hasCols) {
          setFileStatus('error');
          setErrorMessage('Missing required columns: Test Adı, Sonuç, Birim');
          return;
        }

        const cleanedData = data.map(row => ({
          test_name: row['Test Adı'],
          value: row['Sonuç'],
          unit: row['Birim']
        })).filter(row => row.test_name && row.value !== undefined && row.value !== ''); 

        setParsedLabs(cleanedData);
        setFileStatus('loaded');
        setErrorMessage('');
      },
      error: (error) => {
        setFileStatus('error');
        setErrorMessage(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (parsedLabs.length > 0) {
      onDataLoaded(parsedLabs);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Database size={18} color="var(--accent-secondary)" />
        Data Ingestion
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input 
          ref={inputRef} 
          type="file" 
          accept=".csv" 
          style={{ display: 'none' }} 
          onChange={handleChange} 
        />
        
        <div 
          onClick={() => inputRef.current.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{ 
            border: `1px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--surface-border)'}`, 
            borderRadius: '8px', 
            padding: '24px', 
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s ease'
          }}>
          
          {fileStatus === 'idle' && (
            <>
              <FileUp size={24} color={dragActive ? 'var(--accent-primary)' : 'var(--text-secondary)'} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.875rem', color: dragActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                Upload CSV dataset
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>or drag and drop here</div>
            </>
          )}

          {fileStatus === 'loaded' && (
            <>
              <CheckCircle size={24} color="var(--accent-primary)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--accent-primary)' }}>
                Dataset Loaded
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {parsedLabs.length} valid records found
              </div>
            </>
          )}

          {fileStatus === 'error' && (
            <>
              <AlertCircle size={24} color="var(--color-critical)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--color-critical)' }}>
                Upload Failed
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {errorMessage}
              </div>
            </>
          )}
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleAnalyze} 
          disabled={fileStatus !== 'loaded' || isProcessing}
        >
          {isProcessing ? 'Analyzing...' : 'Analyze Results'}
        </button>
      </div>
    </div>
  );
}

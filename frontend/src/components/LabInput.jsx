import React, { useState, useRef } from 'react';
import { FileUp, Database, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import Papa from 'papaparse';

export default function LabInput({ onDataLoaded, isProcessing }) {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' or 'manual'
  
  const [dragActive, setDragActive] = useState(false);
  const [fileStatus, setFileStatus] = useState('idle'); // idle, loaded, error
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedLabs, setParsedLabs] = useState([]);
  const inputRef = useRef(null);

  // Manual form state
  const [manualForm, setManualForm] = useState({
    test_name: '',
    value: '',
    unit: '',
    min_reference: '',
    max_reference: ''
  });

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

        const requiredCols = ['Test_Name', 'Result', 'Unit'];
        const hasCols = requiredCols.every(col => Object.keys(data[0]).includes(col));
        
        if (!hasCols) {
          setFileStatus('error');
          setErrorMessage('Missing required columns: Test_Name, Result, Unit');
          return;
        }

        const cleanedData = data.map(row => {
          let min_ref = parseFloat(row['Min_Reference']);
          let max_ref = parseFloat(row['Max_Reference']);
          
          return {
            test_name: row['Test_Name'],
            value: row['Result'],
            unit: row['Unit'] === '-' ? '' : row['Unit'],
            reference_range_str: row['Reference_Range'] || null,
            min_reference: isNaN(min_ref) ? null : min_ref,
            max_reference: isNaN(max_ref) ? null : max_ref,
            status: row['Status'] || null,
            comment: row['Comment'] || null,
            recommended_followup: row['Recommended_Followup'] || null
          };
        }).filter(row => row.test_name && row.value !== undefined && row.value !== '');

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

  const handleAnalyzeCSV = () => {
    if (parsedLabs.length > 0) {
      onDataLoaded(parsedLabs);
    }
  };

  const handleManualChange = (e) => {
    setManualForm({ ...manualForm, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.test_name || !manualForm.value) return;
    
    const min_ref = manualForm.min_reference ? parseFloat(manualForm.min_reference) : null;
    const max_ref = manualForm.max_reference ? parseFloat(manualForm.max_reference) : null;
    
    const singleRecord = [{
      test_name: manualForm.test_name,
      value: manualForm.value,
      unit: manualForm.unit,
      reference_range_str: null,
      min_reference: isNaN(min_ref) ? null : min_ref,
      max_reference: isNaN(max_ref) ? null : max_ref,
      status: null,
      comment: null,
      recommended_followup: null
    }];
    
    onDataLoaded(singleRecord);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Database size={18} color="var(--accent-secondary)" />
          Data Ingestion
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('manual')}
          style={{
            flex: 1,
            padding: '8px',
            background: activeTab === 'manual' ? 'var(--surface-active)' : 'transparent',
            border: `1px solid ${activeTab === 'manual' ? 'var(--accent-secondary)' : 'var(--surface-border)'}`,
            borderRadius: '6px',
            color: activeTab === 'manual' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          Manual Input
        </button>
        <button 
          onClick={() => setActiveTab('csv')}
          style={{
            flex: 1,
            padding: '8px',
            background: activeTab === 'csv' ? 'var(--surface-active)' : 'transparent',
            border: `1px solid ${activeTab === 'csv' ? 'var(--accent-primary)' : 'var(--surface-border)'}`,
            borderRadius: '6px',
            color: activeTab === 'csv' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          CSV Upload
        </button>
      </div>
      
      {activeTab === 'csv' ? (
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
            onClick={handleAnalyzeCSV} 
            disabled={fileStatus !== 'loaded' || isProcessing}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Results'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Test Name *</label>
            <input 
              name="test_name"
              value={manualForm.test_name}
              onChange={handleManualChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
              placeholder="e.g. Glukoz"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Result *</label>
              <input 
                name="value"
                value={manualForm.value}
                onChange={handleManualChange}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                placeholder="280"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Unit</label>
              <input 
                name="unit"
                value={manualForm.unit}
                onChange={handleManualChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                placeholder="mg/dL"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Min Reference</label>
              <input 
                name="min_reference"
                type="number"
                step="any"
                value={manualForm.min_reference}
                onChange={handleManualChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                placeholder="70"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Max Reference</label>
              <input 
                name="max_reference"
                type="number"
                step="any"
                value={manualForm.max_reference}
                onChange={handleManualChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                placeholder="100"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="btn-primary" 
            style={{ marginTop: '8px' }}
            disabled={isProcessing || !manualForm.test_name || !manualForm.value}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Single Result'}
          </button>
        </form>
      )}
    </div>
  );
}

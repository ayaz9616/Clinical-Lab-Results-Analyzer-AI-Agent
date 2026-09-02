import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import LabInput from './components/LabInput';
import AnalysisSummary from './components/AnalysisSummary';
import WorkflowMap from './components/WorkflowMap';
import ResultsDisplay from './components/ResultsDisplay';
import ApiTester from './components/ApiTester';
import './index.css';

function App() {
  const [rawLabs, setRawLabs] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemState, setSystemState] = useState(null);

  const clientId = useMemo(() => Math.random().toString(36).substring(2, 15), []);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/workflow/${clientId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSystemState(data);
    };
    return () => ws.close();
  }, [clientId]);
  const handleDataLoaded = async (data) => {
    setRawLabs(data);
    setIsProcessing(true);
    setAnalysisResults(null);
    
    try {
      const response = await fetch('http://localhost:8000/analyze_labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labs: data, client_id: clientId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results = await response.json();
      
      setAnalysisResults(results);
      
      setTimeout(() => setSystemState(null), 3000);
      
    } catch (err) {
      console.error("Error analyzing labs:", err);
      setSystemState(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="layout-grid">
      <Header />
      
      <div className="left-sidebar">
        <LabInput onDataLoaded={handleDataLoaded} isProcessing={isProcessing} />
        <ApiTester />
        <AnalysisSummary data={rawLabs} results={analysisResults} />
      </div>
      
      <div className="main-workspace">
        <WorkflowMap systemState={systemState} />
        <ResultsDisplay results={analysisResults} />
      </div>
    </div>
  );
}

export default App;

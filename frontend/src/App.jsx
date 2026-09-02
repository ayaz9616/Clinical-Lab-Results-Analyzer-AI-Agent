import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import LabInput from './components/LabInput';
import AnalysisSummary from './components/AnalysisSummary';
import WorkflowMap from './components/WorkflowMap';
import ResultsDisplay from './components/ResultsDisplay';
import ApiTester from './components/ApiTester';
import Docs from './components/Docs';
import './index.css';

function App() {
  const [rawLabs, setRawLabs] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemState, setSystemState] = useState(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [currentView, setCurrentView] = useState('app');

  const clientId = useMemo(() => Math.random().toString(36).substring(2, 15), []);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/workflow';
    const ws = new WebSocket(`${wsUrl}/${clientId}`);
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
      const payload = { labs: data, client_id: clientId };
      if (userApiKey) {
        payload.api_key = userApiKey;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/analyze_labs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  if (currentView === 'docs') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#0b1120', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px 0 32px' }}>
          <Header currentView={currentView} setCurrentView={setCurrentView} />
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Docs />
        </div>
      </div>
    );
  }

  return (
    <div className="layout-grid">
      <Header userApiKey={userApiKey} setApiKey={setUserApiKey} currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className="left-sidebar">
        <LabInput onDataLoaded={handleDataLoaded} isProcessing={isProcessing} />
        <ApiTester userApiKey={userApiKey} setApiKey={setUserApiKey} />
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

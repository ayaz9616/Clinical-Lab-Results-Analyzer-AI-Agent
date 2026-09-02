import React, { useState } from 'react';
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

  const simulateWorkflowState = async () => {
    setSystemState({ nodes: ['input', 'agent'], edges: ['input-agent'] });
    await new Promise(r => setTimeout(r, 600));
    
    setSystemState({ nodes: ['classify', 'mcp'], edges: ['agent-classify', 'agent-mcp'] });
    await new Promise(r => setTimeout(r, 800));
    
    setSystemState({ nodes: ['classify', 'ref'], edges: ['mcp-ref'] });
    await new Promise(r => setTimeout(r, 600));
    
    setSystemState({ nodes: ['route'], edges: ['classify-route', 'ref-route'] });
    await new Promise(r => setTimeout(r, 600));
    
    setSystemState({ nodes: ['critical', 'warning', 'normal'], edges: ['route-critical', 'route-warning', 'route-normal'] });
    await new Promise(r => setTimeout(r, 600));
    
    setSystemState({ nodes: ['explain'], edges: ['critical-explain', 'warning-explain', 'normal-explain'] });
  };

  const handleDataLoaded = async (data) => {
    setRawLabs(data);
    setIsProcessing(true);
    setAnalysisResults(null);
    
    const animationPromise = simulateWorkflowState();
    
    try {
      const response = await fetch('http://localhost:8000/analyze_labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labs: data })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results = await response.json();
      
      await animationPromise;
      
      setSystemState({ nodes: ['results'], edges: ['explain-results'] });
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

import React, { useState } from 'react';
import Header from './components/Header';
import LabInput from './components/LabInput';
import AnalysisSummary from './components/AnalysisSummary';
import WorkflowMap from './components/WorkflowMap';
import ResultsDisplay from './components/ResultsDisplay';
import './index.css';

function App() {
  const [rawLabs, setRawLabs] = useState(null);

  const handleDataLoaded = (data) => {
    setRawLabs(data);
  };

  return (
    <div className="layout-grid">
      <Header />
      
      <div className="left-sidebar">
        <LabInput onDataLoaded={handleDataLoaded} />
        <AnalysisSummary data={rawLabs} />
      </div>
      
      <div className="main-workspace">
        <WorkflowMap />
        <ResultsDisplay />
      </div>
    </div>
  );
}

export default App;

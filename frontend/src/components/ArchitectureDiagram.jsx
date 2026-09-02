import React from 'react';

const NodeCard = ({ x, y, title, subtitle, status, icon, width = 220 }) => (
  <foreignObject x={x} y={y} width={width} height="90">
    <div xmlns="http://www.w3.org/1999/xhtml" className="arch-node">
      <div className="arch-node-header">
        <span className="arch-node-title">{title}</span>
        {status && (
          <span className={`arch-node-status ${status.toLowerCase()}`}>
            <span className="status-dot"></span>
            {status}
          </span>
        )}
      </div>
      <div className="arch-node-subtitle">{subtitle}</div>
    </div>
  </foreignObject>
);

const AnimatedPath = ({ id, d }) => (
  <>
    <path id={id} d={d} className="arch-path" />
    <circle r="4" className="arch-particle">
      <animateMotion dur="2s" repeatCount="indefinite">
        <mpath href={`#${id}`} />
      </animateMotion>
    </circle>
  </>
);

export default function ArchitectureDiagram() {
  return (
    <div className="arch-container">
      <svg viewBox="0 0 900 1050" className="arch-svg">
        <defs>
          <linearGradient id="safety-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 0.5)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Paths --- */}
        {/* Manual to FastAPI */}
        <AnimatedPath id="path-manual" d="M 230 140 L 230 170 L 410 170 L 410 200" />
        
        {/* CSV to FastAPI */}
        <AnimatedPath id="path-csv" d="M 590 140 L 590 170 L 410 170 L 410 200" />
        
        {/* FastAPI to Agent */}
        <AnimatedPath id="path-agent" d="M 410 290 L 410 340" />
        
        {/* Agent to MCP */}
        <AnimatedPath id="path-mcp-out" d="M 520 385 L 630 385" />
        
        {/* MCP to Classifier */}
        <AnimatedPath id="path-mcp-in" d="M 630 405 L 520 405 L 520 490 L 410 490" />
        
        {/* Agent to Classifier (direct) */}
        <AnimatedPath id="path-classifier" d="M 410 430 L 410 490" />
        
        {/* Classifier to Router */}
        <AnimatedPath id="path-router" d="M 410 580 L 410 640" />

        {/* Router to Gemini (Multiple paths for severity) */}
        <path id="path-route-critical" d="M 370 730 L 320 770 L 320 810" className="arch-path-subtle" />
        <path id="path-route-warning" d="M 410 730 L 410 810" className="arch-path-subtle" />
        <path id="path-route-normal" d="M 450 730 L 500 770 L 500 810" className="arch-path-subtle" />
        
        <circle r="4" className="arch-particle">
          <animateMotion dur="2.5s" repeatCount="indefinite">
            <mpath href="#path-route-critical" />
          </animateMotion>
        </circle>
        <circle r="4" className="arch-particle">
          <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.8s">
            <mpath href="#path-route-warning" />
          </animateMotion>
        </circle>
        <circle r="4" className="arch-particle">
          <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.6s">
            <mpath href="#path-route-normal" />
          </animateMotion>
        </circle>

        {/* Gemini to Results */}
        <AnimatedPath id="path-results" d="M 410 900 L 410 960" />

        {/* --- Safety Boundary --- */}
        <line x1="100" y1="780" x2="720" y2="780" stroke="url(#safety-gradient)" strokeWidth="2" strokeDasharray="8,8" />
        <text x="410" y="770" className="arch-boundary-text" textAnchor="middle">
          DETERMINISTIC BOUNDARY (LLM CANNOT DECIDE SEVERITY)
        </text>

        {/* --- Nodes --- */}
        <NodeCard x="120" y="50" title="Manual Input" subtitle="React Frontend Form" status="ONLINE" />
        <NodeCard x="480" y="50" title="CSV Upload" subtitle="React Batch Upload" status="ONLINE" />
        
        <NodeCard x="300" y="200" title="FastAPI Backend" subtitle="POST /analyze_labs" status="ONLINE" />
        
        <NodeCard x="300" y="340" title="LabAnalysisAgent" subtitle="Core Orchestrator" status="ACTIVE" />
        
        <NodeCard x="630" y="350" title="MCP Server" subtitle="Contextual Lookup Tool" status="READY" />
        
        <NodeCard x="300" y="490" title="Classifier Engine" subtitle="Deterministic Evaluation" status="DETERMINISTIC" />
        
        <NodeCard x="300" y="640" title="Severity Router" subtitle="Critical / Warning / Normal" status="ROUTING" />
        
        <NodeCard x="300" y="810" title="Gemini LLM" subtitle="Clinical Explanation" status="EXPLAINING" />
        
        <NodeCard x="300" y="960" title="Results Output" subtitle="JSON Array" status="READY" />

        {/* --- Legend --- */}
        <g transform="translate(650, 880)" className="arch-legend">
          <rect width="220" height="120" rx="8" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255,255,255,0.1)" />
          <text x="16" y="24" className="arch-legend-title">Legend</text>
          
          <circle cx="24" cy="50" r="4" className="arch-particle-static" filter="url(#glow)" />
          <text x="40" y="54" className="arch-legend-text">Data in transit</text>
          
          <line x1="16" y1="75" x2="32" y2="75" className="arch-path" />
          <text x="40" y="79" className="arch-legend-text">Request Flow</text>

          <line x1="16" y1="100" x2="32" y2="100" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />
          <text x="40" y="104" className="arch-legend-text">Safety Boundary</text>
        </g>
      </svg>
    </div>
  );
}

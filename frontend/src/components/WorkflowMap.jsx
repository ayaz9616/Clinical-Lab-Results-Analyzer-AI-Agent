import React, { useState, useEffect } from 'react';
import { Database, Bot, BrainCircuit, Activity, Network, Split, AlertCircle, AlertTriangle, CheckCircle, MessageSquareText, FileText } from 'lucide-react';

const STATUS_COLORS = {
  idle: 'var(--surface-border)',
  processing: 'var(--accent-primary)',
  success: 'var(--accent-primary)',
  error: 'var(--color-critical)'
};

const Node = ({ id, x, y, width = 160, height = 48, label, icon: Icon, status = 'idle' }) => {
  const isProcessing = status === 'processing';
  
  let borderColor = STATUS_COLORS[status];
  let bgColor = status === 'idle' ? 'var(--glass-bg)' : 'rgba(16, 185, 129, 0.1)';
  let color = status === 'idle' ? 'var(--text-secondary)' : 'var(--text-primary)';
  
  if (status === 'error') {
    bgColor = 'rgba(239, 68, 68, 0.1)';
    color = 'var(--color-critical)';
  }

  // Adjust colors for specific severities if they are active
  if (id === 'critical' && status !== 'idle') {
    borderColor = 'var(--color-critical)';
    bgColor = 'rgba(239, 68, 68, 0.1)';
    color = 'var(--color-critical)';
  } else if (id === 'warning' && status !== 'idle') {
    borderColor = 'var(--color-warning)';
    bgColor = 'rgba(245, 158, 11, 0.1)';
    color = 'var(--color-warning)';
  }

  return (
    <g transform={`translate(${x - width/2}, ${y - height/2})`}>
      {isProcessing && (
        <rect width={width} height={height} rx="8" fill="none" stroke={borderColor} strokeWidth="4" className="node-glow" />
      )}
      <rect 
        width={width} 
        height={height} 
        rx="8" 
        fill={bgColor} 
        stroke={borderColor}
        strokeWidth="2"
        style={{ transition: 'all 0.3s ease' }}
      />
      <foreignObject width={width} height={height}>
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', color, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif'
        }}>
          {Icon && <Icon size={16} />}
          {label}
        </div>
      </foreignObject>
    </g>
  );
};

const Edge = ({ sx, sy, tx, ty, active = false, color = 'var(--accent-primary)' }) => {
  const path = `M ${sx} ${sy} C ${sx} ${(sy+ty)/2}, ${tx} ${(sy+ty)/2}, ${tx} ${ty}`;
  return (
    <g>
      <path d={path} fill="none" stroke="var(--surface-border)" strokeWidth="2" />
      {active && (
        <>
          <path d={path} fill="none" stroke={color} strokeWidth="2" className="edge-active" />
          <circle r="4" fill={color} className="moving-pulse">
            <animateMotion dur="1s" repeatCount="indefinite" path={path} />
          </circle>
        </>
      )}
    </g>
  );
};

export default function WorkflowMap({ systemState = null }) {
  // systemState will be passed from parent in Milestone 9.
  // For Milestone 6, we'll demonstrate a simulated flow if no state is provided.
  const [mockState, setMockState] = useState({ nodes: [], edges: [] });
  
  useEffect(() => {
    if (systemState) return;
    
    // Demonstration loop
    let step = 0;
    const stages = [
      { nodes: ['input'], edges: [] },
      { nodes: ['agent'], edges: ['input-agent'] },
      { nodes: ['classify', 'mcp'], edges: ['agent-classify', 'agent-mcp'] },
      { nodes: ['classify', 'ref'], edges: ['mcp-ref'] },
      { nodes: ['route'], edges: ['classify-route', 'ref-route'] },
      { nodes: ['critical', 'warning', 'normal'], edges: ['route-critical', 'route-warning', 'route-normal'] },
      { nodes: ['explain'], edges: ['critical-explain', 'warning-explain', 'normal-explain'] },
      { nodes: ['results'], edges: ['explain-results'] }
    ];
    
    const interval = setInterval(() => {
      setMockState(stages[step]);
      step = (step + 1) % stages.length;
    }, 1500);
    
    return () => clearInterval(interval);
  }, [systemState]);

  const currentNodes = systemState?.nodes || mockState.nodes;
  const currentEdges = systemState?.edges || mockState.edges;

  const nodeIsActive = (id) => currentNodes.includes(id);
  const edgeIsActive = (id) => currentEdges.includes(id);

  return (
    <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Network size={18} color="var(--accent-secondary)" />
        Live Architecture Workflow
      </h2>
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        <svg viewBox="0 0 800 800" style={{ width: '100%', height: '100%' }}>
          <defs>
            <style>
              {`
                .node-glow {
                  animation: pulse-glow 1.5s infinite alternate;
                }
                @keyframes pulse-glow {
                  from { opacity: 0.3; stroke-width: 2px; }
                  to { opacity: 0.8; stroke-width: 6px; }
                }
                .edge-active {
                  animation: draw-line 1s forwards;
                  stroke-dasharray: 1000;
                  stroke-dashoffset: 1000;
                }
                @keyframes draw-line {
                  to { stroke-dashoffset: 0; }
                }
              `}
            </style>
          </defs>
          
          {/* Edges */}
          <Edge sx={400} sy={74} tx={400} ty={126} active={edgeIsActive('input-agent')} />
          <Edge sx={400} sy={174} tx={200} ty={226} active={edgeIsActive('agent-classify')} />
          <Edge sx={400} sy={174} tx={600} ty={226} active={edgeIsActive('agent-mcp')} />
          <Edge sx={600} sy={274} tx={600} ty={326} active={edgeIsActive('mcp-ref')} />
          
          <Edge sx={200} sy={274} tx={400} ty={426} active={edgeIsActive('classify-route')} />
          <Edge sx={600} sy={374} tx={400} ty={426} active={edgeIsActive('ref-route')} />
          
          <Edge sx={400} sy={474} tx={200} ty={526} active={edgeIsActive('route-critical')} color="var(--color-critical)" />
          <Edge sx={400} sy={474} tx={400} ty={526} active={edgeIsActive('route-warning')} color="var(--color-warning)" />
          <Edge sx={400} sy={474} tx={600} ty={526} active={edgeIsActive('route-normal')} color="var(--color-normal)" />
          
          <Edge sx={200} sy={574} tx={400} ty={626} active={edgeIsActive('critical-explain')} color="var(--color-critical)" />
          <Edge sx={400} sy={574} tx={400} ty={626} active={edgeIsActive('warning-explain')} color="var(--color-warning)" />
          <Edge sx={600} sy={574} tx={400} ty={626} active={edgeIsActive('normal-explain')} color="var(--color-normal)" />
          
          <Edge sx={400} sy={674} tx={400} ty={726} active={edgeIsActive('explain-results')} />

          {/* Nodes */}
          <Node id="input" x={400} y={50} label="DATA INPUT" icon={Database} status={nodeIsActive('input') ? 'processing' : 'idle'} />
          <Node id="agent" x={400} y={150} label="AGENT" icon={Bot} status={nodeIsActive('agent') ? 'processing' : 'idle'} />
          
          <Node id="classify" x={200} y={250} label="CLASSIFY" icon={Activity} status={nodeIsActive('classify') ? 'processing' : 'idle'} />
          <Node id="mcp" x={600} y={250} label="MCP" icon={BrainCircuit} status={nodeIsActive('mcp') ? 'processing' : 'idle'} />
          <Node id="ref" x={600} y={350} label="REFERENCE RANGE" icon={Database} status={nodeIsActive('ref') ? 'processing' : 'idle'} />
          
          <Node id="route" x={400} y={450} label="ROUTE" icon={Split} status={nodeIsActive('route') ? 'processing' : 'idle'} />
          
          <Node id="critical" x={200} y={550} label="CRITICAL" icon={AlertCircle} width={120} status={nodeIsActive('critical') ? 'processing' : 'idle'} />
          <Node id="warning" x={400} y={550} label="WARNING" icon={AlertTriangle} width={120} status={nodeIsActive('warning') ? 'processing' : 'idle'} />
          <Node id="normal" x={600} y={550} label="NORMAL" icon={CheckCircle} width={120} status={nodeIsActive('normal') ? 'processing' : 'idle'} />
          
          <Node id="explain" x={400} y={650} label="EXPLAIN (LLM)" icon={MessageSquareText} status={nodeIsActive('explain') ? 'processing' : 'idle'} />
          <Node id="results" x={400} y={750} label="RESULTS" icon={FileText} status={nodeIsActive('results') ? 'success' : 'idle'} />
        </svg>
      </div>
    </div>
  );
}

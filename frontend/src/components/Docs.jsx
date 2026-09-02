import React, { useState } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram';

const SECTIONS = [
  { id: 'intro', title: 'Introduction', group: 'GETTING STARTED' },
  { id: 'architecture', title: 'Architecture', group: 'GETTING STARTED' },
  { id: 'agent', title: 'Agent Workflow', group: 'CORE MECHANICS' },
  { id: 'mcp', title: 'MCP Fallback', group: 'CORE MECHANICS' },
  { id: 'concurrency', title: 'LLM Concurrency', group: 'PERFORMANCE' },
  { id: 'byok', title: 'Bring Your Own Key', group: 'FEATURES' },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div className="docs-container">
      {/* Sidebar Navigation */}
      <nav className="docs-sidebar">
        {SECTIONS.reduce((acc, section, index) => {
          const isNewGroup = index === 0 || SECTIONS[index - 1].group !== section.group;
          if (isNewGroup) {
            acc.push(
              <div key={`group-${section.group}`} className="docs-nav-group">
                {section.group}
              </div>
            );
          }
          acc.push(
            <div
              key={section.id}
              className={`docs-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.title}
            </div>
          );
          return acc;
        }, [])}
      </nav>

      {/* Main Content Area */}
      <main className="docs-content">
        
        {activeSection === 'intro' && (
          <section className="docs-section">
            <h1 className="docs-title">Introduction</h1>
            <p className="docs-paragraph">
              Clinical Lab Intelligence is an advanced, full-stack laboratory results analyzer built for the Aragen Hackathon. 
              It combines deterministic medical rules with Explainable AI to process, classify, and explain clinical lab results in real-time.
            </p>
            
            <h2 className="docs-subtitle">What it is</h2>
            <p className="docs-paragraph">
              The application provides a seamless interface where healthcare professionals or patients can either manually input a lab test 
              or upload a batch CSV dataset. Behind the scenes, an intelligent Agent dynamically verifies the data, 
              fetches missing reference ranges via the Model Context Protocol (MCP), hard-classifies the severity, and 
              spins up concurrent Large Language Model instances to generate personalized clinical explanations for every single result.
            </p>

            <h2 className="docs-subtitle">Core Principles</h2>
            <ul className="docs-list">
              <li><strong>Determinism:</strong> The LLM is <em>never</em> used to determine if a patient is critical. Mathematical boundaries decide severity.</li>
              <li><strong>Explainability:</strong> Users don't just see "Abnormal"—they get a plain-language explanation of what the test measures.</li>
              <li><strong>Performance:</strong> Large datasets are processed in parallel, heavily guarded by exponential backoff and rate-limit semaphores.</li>
            </ul>
          </section>
        )}

        {activeSection === 'architecture' && (
          <section className="docs-section" style={{ maxWidth: '1000px' }}>
            <h1 className="docs-title">Architecture</h1>
            <p className="docs-paragraph">
              The pipeline strictly follows a one-way deterministic flow to ensure medical safety constraints.
            </p>

            <ArchitectureDiagram />
          </section>
        )}

        {activeSection === 'agent' && (
          <section className="docs-section">
            <h1 className="docs-title">Agent Workflow</h1>
            <p className="docs-paragraph">
              The `LabAnalysisAgent` is the core orchestrator of the backend. It guarantees that the sequence of 
              <strong> Classify → Route → Explain</strong> is never violated.
            </p>
            <h2 className="docs-subtitle">Step 1: Classify</h2>
            <p className="docs-paragraph">
              The Agent receives a standardized `LabTestInput`. It compares the `value` against the `min_reference` and `max_reference`.
              If the values are within bounds, it returns NORMAL. If they are outside, it checks the explicit project severity policy. 
              Crucially, this is purely deterministic math.
            </p>
            <h2 className="docs-subtitle">Step 2: Route</h2>
            <p className="docs-paragraph">
              Once classified, results are grouped and prioritized. CRITICAL results are surfaced to the top, WARNINGs in the middle, and NORMALs at the bottom.
            </p>
            <h2 className="docs-subtitle">Step 3: Explain</h2>
            <p className="docs-paragraph">
              Only after the severity is locked in does the Agent invoke the LLM. The LLM is given a strict prompt containing the hardcoded severity and is instructed never to override it.
            </p>
          </section>
        )}

        {activeSection === 'mcp' && (
          <section className="docs-section">
            <h1 className="docs-title">MCP Fallback</h1>
            <p className="docs-paragraph">
              The Model Context Protocol (MCP) is integrated specifically to solve the missing-data problem.
            </p>
            <p className="docs-paragraph">
              If a CSV upload is missing the `Min_Reference` or `Max_Reference` columns for a specific test, the application does not crash. 
              Instead, the backend spawns a local `stdio` MCP client which communicates with the `mcp/server.py`. 
            </p>
            <p className="docs-paragraph">
              The server exposes a tool called `reference_range_lookup(test_name)`. It returns standard clinical ranges (e.g., 70-100 for Glucose), allowing the Agent to proceed with deterministic classification. 
              The application intentionally avoids routing the entire Gemini LLM payload through MCP, maintaining architectural purity where MCP is strictly a contextual data retrieval layer.
            </p>
          </section>
        )}

        {activeSection === 'concurrency' && (
          <section className="docs-section">
            <h1 className="docs-title">LLM Concurrency</h1>
            <p className="docs-paragraph">
              To handle large CSV uploads without timing out, the LLM invocation layer was entirely rewritten using `asyncio`.
            </p>
            <ul className="docs-list">
              <li><strong>asyncio.gather:</strong> Multiple LLM requests are fired in parallel rather than a slow, blocking `for` loop. The gather function perfectly preserves the original array order when results return.</li>
              <li><strong>Semaphore:</strong> An `asyncio.Semaphore(5)` caps the maximum active connections to the Google Gemini API to 5, preventing rate-limit bans (HTTP 429).</li>
              <li><strong>Exponential Backoff:</strong> The `LLMProvider` is wrapped in a bounded retry loop. If a transient network error occurs, it waits `2^attempt` seconds and retries up to 3 times before returning a safe fallback message, ensuring the entire dataset analysis doesn't crash due to one failed row.</li>
            </ul>
          </section>
        )}

        {activeSection === 'byok' && (
          <section className="docs-section">
            <h1 className="docs-title">Bring Your Own Key</h1>
            <p className="docs-paragraph">
              In a hackathon or production environment, global API limits can quickly be exhausted. 
            </p>
            <p className="docs-paragraph">
              This application features a fully plumbed BYOK (Bring Your Own Key) architecture. Users can enter their personal Gemini API key in the top right header.
              This key is appended to the `POST /analyze_labs` payload. The backend detects this and dynamically instantiates a unique `genai.Client` for that specific request, 
              completely overriding the server's local `.env` configuration. 
            </p>
          </section>
        )}

      </main>
    </div>
  );
}

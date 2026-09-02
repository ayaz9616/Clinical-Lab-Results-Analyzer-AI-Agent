<div align="center">
  
# 🏥 Clinical Lab Intelligence

**A full-stack, AI-powered laboratory results analyzer built for precision, speed, and safety.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Frontend-10b981?style=for-the-badge&logo=vercel)](https://clinical-lab-results-analyzer-ai-agent-frontend.vercel.app/) <!-- Update this link if you have a custom Vercel domain -->
[![Backend API](https://img.shields.io/badge/Backend_API-Render-06b6d4?style=for-the-badge&logo=render)](https://clinical-lab-results-analyzer-ai-agent.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)]()
[![Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat-square&logo=google&logoColor=white)]()

</div>

---

Instead of asking a Large Language Model (LLM) to dangerously "guess" if a patient is critical, this application pioneers a **hybrid deterministic-AI pipeline**. Hardcoded mathematical bounds ensure 100% accurate medical severity classification, while asynchronous LLM instances generate rich, personalized, plain-language clinical explanations for each result.

---

## ✨ Features

- **Multi-Modal Data Ingestion**: Manually input a single lab test or upload bulk CSV datasets.
- **Deterministic Classification**: Mathematical evaluation of results against reference ranges (Normal / Warning / Critical).
- **Intelligent Routing**: Severity-based sorting to ensure critical patients are prioritized.
- **Explainable AI (XAI)**: Concurrent LLM instances explain *why* a result is flagged in clinically relevant language without overriding the deterministic severity.
- **MCP Fallback (Model Context Protocol)**: Automatic retrieval of missing reference ranges via a local MCP server integration.
- **High-Performance Concurrency**: `asyncio.gather` and semaphore-based rate limiting to process hundreds of CSV rows in parallel without hitting API limits.
- **Bring Your Own Key (BYOK)**: Secure, dynamic injection of personal Gemini API keys via the UI to bypass server quotas.

---

## 🏗️ Architecture

To see the interactive, animated architecture diagram with live data flow, launch the application and click the **Dashboard** button in the top right corner.

**High-Level Pipeline:**
1. `React Frontend` captures CSV or manual input.
2. `FastAPI Backend` receives the payload (`POST /analyze_labs`).
3. `LabAnalysisAgent` orchestrates the pipeline.
4. `MCP Client` connects to the `MCP Server` to fetch missing reference ranges.
5. `Classifier Engine` deterministically categorizes the severity.
6. `Severity Router` sorts the payload.
7. `Gemini LLM` concurrently explains the results based on the hard classification.
8. `React Frontend` renders the data.

---

## 🔄 Agent Workflow

The core orchestrator is the `LabAnalysisAgent`, which strictly enforces the **Classify → Route → Explain** pattern.

### 1. CLASSIFY
- **Input**: Raw lab values, test names, and units.
- **Processing**: The value is mathematically compared against `min_reference` and `max_reference`. If reference ranges are missing, the Agent fetches them via MCP.
- **Output**: Deterministic severity flag (Normal, Warning, or Critical).
- **Safety Constraint**: The LLM is **never** involved in this step.

### 2. ROUTE
- **Input**: Classified results.
- **Processing**: Sorts and groups the results to bubble up Critical findings to the top.
- **Output**: An ordered list of results.

### 3. EXPLAIN
- **Input**: Routed results with locked-in severities.
- **Processing**: The LLM is provided a highly specific prompt containing the test data and the hardcoded severity. 
- **Output**: A plain-language clinical explanation.
- **Safety Constraint**: The prompt explicitly forbids the LLM from overriding the severity classification.

---

## 🧠 Explainable AI

Explainability is a core tenet of this project. Users do not just receive an "Abnormal" flag. The LLM generates a short paragraph contextualizing the result, explaining what the biomarker means, and suggesting potential (non-diagnostic) next steps, strictly framed around the deterministic severity constraint.

---

## 🔌 MCP Reference Lookup

The **Model Context Protocol (MCP)** is specifically utilized as a contextual data retrieval layer, not an LLM proxy.

- **Scenario**: A user uploads a CSV containing a Glucose level of 115 mg/dL, but the `Min_Reference` and `Max_Reference` columns are blank.
- **Flow**: `LabAnalysisAgent` → `MCP Client` → `mcp/server.py` → `reference_range_lookup("Glucose")`
- **Result**: The MCP server returns "70-100". The Agent resumes deterministic classification. 

The entire LLM payload is **not** routed through MCP, preserving architectural purity and ensuring MCP is strictly used for tool-based context augmentation.

---

## ⚡ Concurrent LLM Processing

Processing a CSV with hundreds of rows sequentially would result in severe UX latency. This project implements advanced asynchronous patterns:

- **Parallel Execution**: Uses `asyncio.gather()` to fire all LLM explanation requests in parallel while preserving array order.
- **Semaphore Limits**: `asyncio.Semaphore(5)` caps concurrent outgoing HTTP requests to the Gemini API to 5, preventing rate-limit bans (HTTP 429).
- **Exponential Backoff**: Transient network or API failures trigger an exponential backoff loop (`2^attempt` seconds), up to 3 retries, ensuring the entire dataset analysis does not crash due to a single row failure.

---

## 🔑 Bring Your Own Key (BYOK)

To guarantee evaluation success despite shared API quotas, the system implements a secure BYOK override.

- **Flow**: User enters API key in React sidebar → Key appended to `POST /analyze_labs` JSON body → `LLMProvider` intercepts request → Dynamically instantiates an ephemeral `genai.Client(api_key=user_key)`.
- **Security**: The key is never logged, persisted, or saved to the server's `.env` file. It only lives for the duration of the HTTP request context.

---

## 🚀 Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # (or source .venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
cp ../.env.example ../.env      # Add your GEMINI API key here
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

The backend includes a comprehensive test suite to verify the deterministic engine and agent orchestration.

```bash
cd backend
pytest tests/
```

**What is tested:**
- Validating Normal, Warning, and Critical bounds.
- Missing reference range handling via MCP.
- End-to-end agent workflow preserving severity states.
- Invalid test names.

---

## 🎬 Demo

**Recommended 2-Minute Hackathon Demo Script:**
1. **Show the Dashboard**: Click the "Dashboard" button in the top right. Point out the clear architectural safety boundary between the Deterministic Engine and the LLM.
2. **BYOK**: Paste your Gemini API key in the "Bring Your Own Key" sidebar input to prove dynamic quota overriding.
3. **Manual Input**: Input `Glucose`, Value: `45`, Min: `70`, Max: `100`. Hit Analyze. Show that it is instantly flagged as **Critical** (Deterministic) and the LLM explains *why* (Hypoglycemia).
4. **CSV Batch Processing**: Drag and drop `dummy_lab_results_variety.csv`. Hit Analyze.
5. **Concurrency Proof**: Watch the console terminal—show how `asyncio.Semaphore` fires exactly 5 requests at a time, protecting the API limits while processing the whole file in seconds.

---

## 📁 Project Structure

```text
aragen/
├── backend/
│   ├── app/
│   │   ├── agents/       # LabAnalysisAgent (Orchestrator)
│   │   ├── api/          # FastAPI Routes (analyze_labs)
│   │   ├── core/         # LLMProvider, Config
│   │   ├── mcp/          # MCP Client & FastMCP Server
│   │   ├── models/       # Pydantic schemas
│   │   └── services/     # Deterministic Classification & Routing
│   └── tests/            # Pytest suite
├── frontend/
│   ├── src/
│   │   ├── components/   # React UI (LabInput, ArchitectureDiagram)
│   │   ├── App.jsx       # State Routing
│   │   └── index.css     # Observability Dashboard Styling
├── .env                  # Environment Variables
└── README.md
```

---

## 🛡️ Safety & Design Principles

Clinical data is highly sensitive. This architecture guarantees that **No LLM hallucination can change a patient's severity status from Critical to Normal**. AI is used exclusively for augmenting human understanding (Explainability), never for primary diagnosis (Classification).

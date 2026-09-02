# Clinical Lab Results Analyzer AI Agent

A full-stack web application designed for the Aragen Hackathon to analyze clinical laboratory results using a deterministic agent-based architecture, the Model Context Protocol (MCP), and a Large Language Model (LLM).

> [!WARNING]  
> **Medical Disclaimer**
> This application is for informational and demonstration purposes only. It does not provide medical diagnosis or treatment recommendations and is not a substitute for evaluation by a qualified healthcare professional. Laboratory results should be interpreted in the context of the patient's clinical history and laboratory-specific reference ranges.

## 1. Project Overview & Features
This application allows users to upload clinical laboratory results (via CSV) and instantly visualizes an automated analysis pipeline. 

### Features:
* **Live Workflow Map:** Real-time visualization of the backend pipeline using WebSockets.
* **Deterministic Classification:** Hard-coded logic accurately classifies results as NORMAL, WARNING, or CRITICAL.
* **LLM Explanations:** AI-generated clinical explanations for every single lab result.
* **Agent Architecture:** Follows a strict CLASSIFY → ROUTE → EXPLAIN workflow.
* **MCP Fallback:** Uses an MCP tool to fetch missing reference ranges.

## 2. Architecture & Flow

The application is built on a **FastAPI** backend and a **React (Vite)** frontend. The core Agent logic follows a strict pipeline:

1. **INPUT:** The React frontend parses the CSV dataset and sends it to the backend via POST `/analyze_labs`.
2. **CLASSIFY:** The Agent compares each lab result against its reference range and assigns a severity (`NORMAL`, `WARNING`, or `CRITICAL`).
3. **ROUTE:** The Agent groups and prioritizes the results by severity (CRITICAL first).
4. **EXPLAIN:** The Agent invokes the LLM to generate a plain-language explanation for *every* individual result.

### AI Provider & LLM Role
* **Provider/Model:** Google Gemini (default `gemini-3.6-flash`, configurable via `.env`).
* **Role:** The LLM's sole responsibility is generating human-readable explanations based on the supplied data. It is explicitly instructed **NOT** to diagnose diseases, invent reference ranges, or override the backend's severity classification.

### MCP Role
* The **Model Context Protocol (MCP)** is used as a fallback lookup tool. If a lab test is missing reference range information in the uploaded CSV, the backend invokes the local MCP `reference_range_lookup` tool to fetch it.

## 3. Reference-Range Priority & Classification Policy

The application never silently invents reference ranges. It follows a strict priority order:
1. `Min_Reference` + `Max_Reference` from the uploaded CSV.
2. `Reference_Range` string from the uploaded CSV.
3. Local MCP `reference_range_lookup(test_name)` fallback.
4. If none are available, the result is marked as `UNKNOWN`.

### Project Classification Policy
The assignment does not mandate universal medical thresholds. Therefore, we use a configurable **Project Classification Policy** to distinguish WARNING from CRITICAL severity:
- Results *within* the reference range are **NORMAL**.
- Results *outside* the reference range are abnormal. An explicit policy map (defined in `classification.py`) dictates whether the abnormality is a **WARNING** or **CRITICAL**.
- If a test is not in the explicit policy map, the application uses a fallback logic (30% boundary outside the reference span) to classify the severity. **This is a project-specific rule, not a universal medical standard.**

## 4. Dataset Information & Test Data
The application natively supports the provided Kaggle Laboratory Dataset. It can parse Turkish test names, handle categorical strip tests (e.g., `Negatif`, `1+`), and retain all original reference ranges.

### Synthetic Test Data
For quick testing, we have provided three synthetic CSV files in the `/test_data` directory:
- `dummy_normal.csv`: Contains results entirely within normal reference ranges.
- `dummy_warning.csv`: Contains results that trigger WARNING classifications.
- `dummy_critical.csv`: Contains extreme results that trigger CRITICAL classifications.

*Note: These files contain entirely synthetic dummy data and are not real patient records.*

## 5. Setup & Installation

### Prerequisites
* Python 3.10+
* Node.js 18+

### Environment Variables
Create a `.env` file in the project root containing:
```
LLM_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-3.6-flash
```

### Start the Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running Tests
The backend contains a complete test suite covering classification bounds, agent routing, and mocked LLM calls.
```bash
cd backend
python -m pytest -q
```

## 6. How to Use
1. Open the frontend in your browser (usually `http://localhost:5173`).
2. Drag and drop a CSV file (e.g., `test_data/dummy_critical.csv`) into the Data Ingestion panel.
3. Click **Analyze Results**.
4. Watch the Live Architecture Workflow map illuminate the exact path taken by the backend in real-time.
5. Review the color-coded, prioritized results and LLM explanations on the right.

## 7. Known Limitations
- The MCP tool currently runs locally via `stdio` and returns a hardcoded mock range if the test is unmapped. In a production scenario, this would connect to an external clinical database or FHIR server.
- The LLM generation is performed sequentially; a large CSV (100+ rows) may take considerable time to process.

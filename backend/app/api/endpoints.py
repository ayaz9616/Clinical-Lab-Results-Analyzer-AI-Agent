from fastapi import APIRouter
from pydantic import BaseModel
from app.models.lab import LabAnalysisRequest, LabAnalysisResponse, LabTestResult, AnalysisSummary
from app.agents.lab_agent import LabAnalysisAgent
from google import genai
import uuid

router = APIRouter()
agent = LabAnalysisAgent()

@router.post("/analyze_labs", response_model=LabAnalysisResponse)
async def analyze_labs(request: LabAnalysisRequest):
    # Agent handles the Classify -> Route -> Explain pipeline
    routed_results = await agent.analyze(request.labs)
    
    # Calculate summary
    summary = AnalysisSummary(
        total=len(routed_results),
        critical=sum(1 for r in routed_results if r.classification == "CRITICAL"),
        warning=sum(1 for r in routed_results if r.classification == "WARNING"),
        normal=sum(1 for r in routed_results if r.classification == "NORMAL")
    )
    
    return LabAnalysisResponse(
        analysis_id=str(uuid.uuid4()),
        status="completed",
        summary=summary,
        results=routed_results
    )

class TestLLMRequest(BaseModel):
    api_key: str
    question: str

class TestLLMResponse(BaseModel):
    answer: str

@router.post("/test_llm", response_model=TestLLMResponse)
async def test_llm(request: TestLLMRequest):
    try:
        client = genai.Client(api_key=request.api_key)
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=request.question
        )
        return TestLLMResponse(answer=response.text)
    except Exception as e:
        return TestLLMResponse(answer=f"Error: {str(e)}")

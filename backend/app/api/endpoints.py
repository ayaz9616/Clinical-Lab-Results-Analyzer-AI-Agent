from fastapi import APIRouter
from app.models.lab import LabAnalysisRequest, LabAnalysisResponse, AnalysisSummary
from app.agents.lab_agent import LabAnalysisAgent
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

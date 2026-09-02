from fastapi import APIRouter
from app.models.lab import LabAnalysisRequest, LabAnalysisResponse, LabTestResult, AnalysisSummary
from app.services.classification import classify_result, get_reference_range
from app.services.routing import route_results
import uuid

router = APIRouter()

@router.post("/analyze_labs", response_model=LabAnalysisResponse)
async def analyze_labs(request: LabAnalysisRequest):
    results = []
    
    for lab in request.labs:
        classification = await classify_result(lab)
        ref_range = await get_reference_range(lab.test_name)
        
        result = LabTestResult(
            test_name=lab.test_name,
            value=lab.value,
            unit=lab.unit,
            classification=classification,
            reference_range=ref_range,
            explanation=None, # To be implemented in later milestone
            next_steps=None
        )
        results.append(result)
        
    routed_results = route_results(results)
    
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

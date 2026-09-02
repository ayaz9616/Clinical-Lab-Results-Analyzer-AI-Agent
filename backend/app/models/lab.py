from pydantic import BaseModel
from typing import List, Optional, Any

class LabTestInput(BaseModel):
    test_name: str
    value: Any
    unit: str
    reference_range_str: Optional[str] = None
    min_reference: Optional[float] = None
    max_reference: Optional[float] = None
    status: Optional[str] = None
    comment: Optional[str] = None
    recommended_followup: Optional[str] = None

class LabAnalysisRequest(BaseModel):
    labs: List[LabTestInput]
    client_id: Optional[str] = None

class ReferenceRange(BaseModel):
    low: Optional[float] = None
    high: Optional[float] = None
    text_value: Optional[str] = None

class LabTestResult(BaseModel):
    test_name: str
    value: Any
    unit: str
    classification: str
    reference_range: Optional[ReferenceRange] = None
    explanation: Optional[str] = None
    next_steps: Optional[List[str]] = None

class AnalysisSummary(BaseModel):
    total: int
    critical: int
    warning: int
    normal: int

class LabAnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    summary: AnalysisSummary
    results: List[LabTestResult]

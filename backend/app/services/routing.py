from typing import List
from app.models.lab import LabTestResult

def route_results(results: List[LabTestResult]) -> List[LabTestResult]:
    """Sort results by severity: CRITICAL > WARNING > NORMAL > UNKNOWN"""
    severity_order = {"CRITICAL": 0, "WARNING": 1, "NORMAL": 2, "UNKNOWN": 3}
    return sorted(results, key=lambda r: severity_order.get(r.classification.upper(), 4))

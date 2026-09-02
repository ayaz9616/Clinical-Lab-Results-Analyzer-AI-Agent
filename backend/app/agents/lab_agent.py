from typing import List
from app.models.lab import LabTestInput, LabTestResult
from app.services.classification import classify_result, get_reference_range
from app.services.routing import route_results
from app.core.llm_provider import llm_provider

class LabAnalysisAgent:
    """Agent responsible for the core CLASSIFY -> ROUTE -> EXPLAIN logic."""
    
    def __init__(self):
        pass
        
    async def classify(self, labs: List[LabTestInput]) -> List[LabTestResult]:
        """CLASSIFY: Compare values to reference ranges and determine status."""
        results = []
        for lab in labs:
            classification = await classify_result(lab)
            ref_range = await get_reference_range(lab.test_name)
            
            result = LabTestResult(
                test_name=lab.test_name,
                value=lab.value,
                unit=lab.unit,
                classification=classification,
                reference_range=ref_range,
                explanation=None,
                next_steps=None
            )
            results.append(result)
        return results

    def route(self, results: List[LabTestResult]) -> List[LabTestResult]:
        """ROUTE: Group results by severity."""
        return route_results(results)

    async def explain(self, results: List[LabTestResult]) -> List[LabTestResult]:
        """EXPLAIN: Generate clinical explanations using the LLM Provider."""
        for result in results:
            if result.classification != "NORMAL":
                ref_str = "Not provided"
                if result.reference_range:
                    if result.reference_range.text_value:
                        ref_str = result.reference_range.text_value
                    else:
                        ref_str = f"{result.reference_range.low} - {result.reference_range.high}"
                        
                llm_resp = await llm_provider.generate_explanation(
                    test_name=result.test_name,
                    value=str(result.value),
                    unit=result.unit,
                    ref_range=ref_str,
                    severity=result.classification
                )
                
                result.explanation = llm_resp.explanation
                result.next_steps = llm_resp.next_steps
            else:
                result.explanation = "Result is within normal limits."
                result.next_steps = ["No specific action required."]
        return results

    async def analyze(self, labs: List[LabTestInput]) -> List[LabTestResult]:
        """Main orchestration flow."""
        classified_results = await self.classify(labs)
        routed_results = self.route(classified_results)
        explained_results = await self.explain(routed_results)
        return explained_results

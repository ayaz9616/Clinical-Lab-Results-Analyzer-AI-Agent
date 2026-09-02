from typing import List
from app.models.lab import LabTestInput, LabTestResult
from app.services.classification import classify_result, get_reference_range
from app.services.routing import route_results

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
        """EXPLAIN: Generate clinical explanations. 
        (Integration point established for LLM in Milestone 4)."""
        for result in results:
            if result.classification != "NORMAL":
                result.explanation = "LLM explanation placeholder. Integration point ready."
                result.next_steps = ["LLM next step placeholder."]
            else:
                result.explanation = "Result is within normal limits."
                result.next_steps = ["No specific action required."]
        return results

    async def analyze(self, labs: List[LabTestInput]) -> List[LabTestResult]:
        """Main orchestration flow."""
        # Step 1: CLASSIFY
        classified_results = await self.classify(labs)
        
        # Step 2: ROUTE
        routed_results = self.route(classified_results)
        
        # Step 3: EXPLAIN
        explained_results = await self.explain(routed_results)
        
        return explained_results

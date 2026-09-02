from typing import List, Optional
from app.models.lab import LabTestInput, LabTestResult
from app.services.classification import classify_result, get_reference_range
from app.services.routing import route_results
from app.core.llm_provider import llm_provider
from app.services.websocket import manager

class LabAnalysisAgent:
    """Agent responsible for the core CLASSIFY -> ROUTE -> EXPLAIN logic."""
    
    def __init__(self):
        pass
        
    async def classify(self, labs: List[LabTestInput]) -> List[LabTestResult]:
        """CLASSIFY: Compare values to reference ranges and determine status."""
        results = []
        for lab in labs:
            classification = await classify_result(lab)
            ref_range = await get_reference_range(lab)
            
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
        return results

    async def analyze(self, labs: List[LabTestInput], client_id: Optional[str] = None) -> List[LabTestResult]:
        """Main orchestration flow."""
        if client_id:
            await manager.send_state(client_id, {"nodes": ["input", "agent"], "edges": ["input-agent"]})
            
        if client_id:
            await manager.send_state(client_id, {"nodes": ["classify", "mcp"], "edges": ["agent-classify", "agent-mcp"]})
        classified_results = await self.classify(labs)
        
        if client_id:
            await manager.send_state(client_id, {"nodes": ["route"], "edges": ["classify-route", "ref-route"]})
        routed_results = self.route(classified_results)
        
        if client_id:
            active_nodes = ["explain"]
            active_edges = []
            if any(r.classification == "CRITICAL" for r in routed_results):
                active_nodes.append("critical")
                active_edges.extend(["route-critical", "critical-explain"])
            if any(r.classification == "WARNING" for r in routed_results):
                active_nodes.append("warning")
                active_edges.extend(["route-warning", "warning-explain"])
            if any(r.classification == "NORMAL" for r in routed_results):
                active_nodes.append("normal")
                active_edges.extend(["route-normal", "normal-explain"])
                
            await manager.send_state(client_id, {"nodes": active_nodes, "edges": active_edges})
            
        explained_results = await self.explain(routed_results)
        
        if client_id:
            await manager.send_state(client_id, {"nodes": ["results"], "edges": ["explain-results"]})
            
        return explained_results

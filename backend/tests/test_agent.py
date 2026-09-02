import pytest
from unittest.mock import AsyncMock, patch
from app.agents.lab_agent import LabAnalysisAgent
from app.models.lab import LabTestInput, LabTestResult
from app.core.llm_provider import ExplanationResponse

@pytest.mark.asyncio
async def test_agent_routing_and_llm():
    agent = LabAnalysisAgent()
    
    labs = [
        LabTestInput(test_name="Ferritin", value=82.5, unit="ng/mL", min_reference=15.0, max_reference=150.0), # NORMAL
        LabTestInput(test_name="Ferritin", value=12.0, unit="ng/mL", min_reference=15.0, max_reference=150.0), # WARNING
        LabTestInput(test_name="Glukoz", value=280.0, unit="mg/dL", min_reference=70.0, max_reference=100.0) # CRITICAL
    ]
    
    with patch('app.agents.lab_agent.llm_provider') as mock_llm:
        # Needs to be an AsyncMock for awaitable generate_explanation
        mock_llm.generate_explanation = AsyncMock(return_value=ExplanationResponse(
            explanation="Mock explanation",
            next_steps=["Mock next step"]
        ))
        
        results = await agent.analyze(labs)
        
        # Verify Routing: CRITICAL, WARNING, NORMAL
        assert len(results) == 3
        assert results[0].classification == "CRITICAL"
        assert results[1].classification == "WARNING"
        assert results[2].classification == "NORMAL"
        
        # Verify LLM was called 3 times (once for each result, including NORMAL)
        assert mock_llm.generate_explanation.call_count == 3

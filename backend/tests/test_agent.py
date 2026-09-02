import pytest
import asyncio
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
        mock_llm.generate_explanation = AsyncMock(return_value=ExplanationResponse(
            explanation="Mock explanation",
            next_steps=["Mock next step"]
        ))
        
        results = await agent.analyze(labs)
        
        assert len(results) == 3
        assert results[0].classification == "CRITICAL"
        assert results[1].classification == "WARNING"
        assert results[2].classification == "NORMAL"
        assert mock_llm.generate_explanation.call_count == 3

@pytest.mark.asyncio
async def test_llm_concurrency_ordering():
    agent = LabAnalysisAgent()
    # Generate 10 identical NORMAL tests. Route will preserve their relative order.
    labs = [
        LabTestInput(test_name=f"Test_{i}", value=10.0, unit="mg", min_reference=5.0, max_reference=15.0) 
        for i in range(10)
    ]
    
    with patch('app.agents.lab_agent.llm_provider') as mock_llm:
        async def mock_generate(*args, **kwargs):
            await asyncio.sleep(0.01) # Simulate network delay
            return ExplanationResponse(explanation=f"Exp for {kwargs.get('test_name')}", next_steps=[])
            
        mock_llm.generate_explanation.side_effect = mock_generate
        
        results = await agent.analyze(labs)
        
        assert len(results) == 10
        for i, res in enumerate(results):
            assert res.test_name == f"Test_{i}"
            assert res.explanation == f"Exp for Test_{i}"

@pytest.mark.asyncio
async def test_mcp_lookup_fallback():
    agent = LabAnalysisAgent()
    labs = [LabTestInput(test_name="UnknownTest", value=50.0, unit="u")]
    
    with patch('app.services.classification.execute_mcp_tool') as mock_mcp, \
         patch('app.agents.lab_agent.llm_provider.generate_explanation', new_callable=AsyncMock) as mock_llm:
        
        mock_llm.return_value = ExplanationResponse(explanation="", next_steps=[])
        mock_mcp.return_value = "10.0 - 100.0" 
        
        results = await agent.analyze(labs)
        
        assert mock_mcp.called
        assert mock_mcp.call_args[0][0] == 'reference_range_lookup'
        assert results[0].classification == "NORMAL" 

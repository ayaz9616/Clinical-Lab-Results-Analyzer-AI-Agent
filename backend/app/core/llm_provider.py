import os
import json
from google import genai
from pydantic import BaseModel
from typing import List

class ExplanationResponse(BaseModel):
    explanation: str
    next_steps: List[str]

class LLMProvider:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.model_name = os.getenv("LLM_MODEL", "gemini-2.5-flash")
        
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    async def generate_explanation(self, test_name: str, value: str, unit: str, ref_range: str, severity: str) -> ExplanationResponse:
        if not self.client:
            return ExplanationResponse(
                explanation="[MOCK] LLM API key not configured. The result is outside normal parameters.",
                next_steps=["[MOCK] Consult a healthcare professional."]
            )
            
        prompt = f"""
        You are a clinical laboratory AI assistant.
        Analyze the following lab result:
        Test: {test_name}
        Value: {value} {unit}
        Reference Range: {ref_range}
        Severity: {severity}
        
        Explain what this result means in clinically sensible language. Do not make definitive diagnoses.
        Use cautious phrasing like "may be associated with" or "can indicate".
        Also suggest next steps (e.g., "Discuss with your physician", "Consider follow-up testing").
        
        Return your response strictly in the following JSON format:
        {{
            "explanation": "Your clinical explanation here...",
            "next_steps": ["Step 1", "Step 2"]
        }}
        """
        
        try:
            # We use the blocking call in an async context, ideally we'd use an async client
            # But the genai SDK handles it cleanly or we can wrap it if needed. 
            # For this MVP, standard execution is fine since it's a lightweight backend.
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ExplanationResponse
                )
            )
            
            if hasattr(response, 'parsed') and response.parsed:
                return response.parsed
                
            data = json.loads(response.text)
            return ExplanationResponse(**data)
            
        except Exception as e:
            return ExplanationResponse(
                explanation=f"Error generating clinical explanation. Please consult a healthcare professional. (Internal error: {str(e)})",
                next_steps=["Discuss with a healthcare professional."]
            )

llm_provider = LLMProvider()

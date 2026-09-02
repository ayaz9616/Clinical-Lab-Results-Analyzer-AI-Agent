from typing import Optional
from app.models.lab import LabTestInput, ReferenceRange
from app.mcp.client import execute_mcp_tool
import re

# Hardcoded reference ranges based on the dataset
REFERENCE_RANGES = {
    "Hemoglobin": {"low": 12.0, "high": 15.0},
    "Ferritin": {"low": 15.0, "high": 150.0},
    "Glikozile Hemoglobin (HbA1c)": {"low": 4.0, "high": 6.0},
    "Total IgE": {"low": 0.1, "high": 100.0},
    "İnsülin": {"low": 2.6, "high": 24.9},
    "Serbest T4": {"low": 0.87, "high": 1.70},
    "Trombosit": {"low": 150.0, "high": 450.0},
    "Lökosit": {"low": 5.0, "high": 10.6},
    "Eritrosit": {"low": 3.8, "high": 5.2},
    "Hematokrit": {"low": 35.0, "high": 49.0},
    "RDW-SD": {"low": 36.4, "high": 46.3},
    "RDW": {"low": 11.5, "high": 14.5},
    "PDW": {"low": 9.8, "high": 16.1},
    "PCT": {"low": 0.17, "high": 0.38},
    "Nötrofil%": {"low": 50.0, "high": 70.0},
    "Monosit%": {"low": 2.0, "high": 11.0},
    "Lenfosit%": {"low": 18.0, "high": 42.0},
    "pH (Strip)": {"low": 5.0, "high": 9.0},
    "Dansite (Strip)": {"low": 1.010, "high": 1.030},
    "Ürobilinojen (Strip)": {"text_value": "Normal"},
    "Protein (Strip)": {"text_value": "Negatif"},
    "Nitrit (Strip)": {"text_value": "Negatif"},
    "Lökosit (Strip)": {"text_value": "Negatif"},
    "Keton (Strip)": {"text_value": "Negatif"},
    "Glukoz (Strip)": {"text_value": "Negatif"},
    "Eritrosit (Strip)": {"text_value": "Negatif"},
    "Bilirubin (Strip)": {"text_value": "Negatif"},
}

async def get_reference_range(test_name: str) -> Optional[ReferenceRange]:
    if test_name in REFERENCE_RANGES:
        return ReferenceRange(**REFERENCE_RANGES[test_name])
        
    # If not in hardcoded dict, call MCP tool
    result = await execute_mcp_tool('reference_range_lookup', {'test_name': test_name})
    
    match = re.search(r"(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)", result)
    if match:
        return ReferenceRange(low=float(match.group(1)), high=float(match.group(3)))
        
    return None

async def classify_result(test: LabTestInput) -> str:
    ref = await get_reference_range(test.test_name)
    if not ref:
        return "UNKNOWN"
    
    if ref.text_value is not None:
        val = str(test.value).lower()
        expected = ref.text_value.lower()
        if val == expected:
            return "NORMAL"
        else:
            return "WARNING"
            
    if ref.low is not None and ref.high is not None:
        try:
            val = float(test.value)
            if ref.low <= val <= ref.high:
                return "NORMAL"
            
            range_span = ref.high - ref.low
            margin = range_span * 0.2
            
            if val < (ref.low - margin) or val > (ref.high + margin):
                return "CRITICAL"
            else:
                return "WARNING"
                
        except (ValueError, TypeError):
            return "UNKNOWN"
            
    return "UNKNOWN"

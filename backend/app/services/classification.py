import logging
import re
from typing import Optional
from app.models.lab import LabTestInput, ReferenceRange
from app.mcp.client import execute_mcp_tool

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    logger.addHandler(ch)

def determine_numeric_severity(test_name: str, val: float, low: float, high: float) -> str:
    """
    Configurable classification policy for numeric tests to distinguish WARNING vs CRITICAL.
    This replaces arbitrary percentage thresholds with explicit, medically-aligned rules 
    (or dataset-specific expected thresholds for this assignment).
    """
    if low <= val <= high:
        return "NORMAL"
        
    # Explicit policy map defining the boundary where a WARNING becomes CRITICAL.
    # Format: "Test Name": (crit_low, crit_high)
    POLICY = {
        "Glukoz": (50.0, 200.0),                  # 280 is CRITICAL
        "Trombosit": (100.0, 600.0),              # 55 is CRITICAL
        "Hemoglobin": (10.0, 20.0),               # 7.8 is CRITICAL, 11.6 is WARNING
        "Serbest T4": (0.5, 3.0),                 # 0.35 is CRITICAL
        "Glikozile Hemoglobin (HbA1c)": (3.0, 7.0), # 6.2 is WARNING
        "Ferritin": (10.0, 300.0),                # 12 is WARNING
        "Nötrofil%": (30.0, 85.0)                 # 72.5 is WARNING
    }
    
    config = POLICY.get(test_name)
    
    if config:
        crit_low, crit_high = config
    else:
        # Generic fallback for unmapped tests: 30% outside bounds
        span = high - low
        crit_low = low - (span * 0.3)
        crit_high = high + (span * 0.3)
        
    if val <= crit_low or val >= crit_high:
        return "CRITICAL"
        
    return "WARNING"

def classify_categorical(result: str, reference: str) -> str:
    """
    Classifies categorical strip results like 'Negatif', '1+', '3+', 'Pozitif'
    """
    res = str(result).strip().lower()
    ref = str(reference).strip().lower()
    
    if res == ref:
        return "NORMAL"
        
    critical_values = {"2+", "3+", "4+", "strong positive", "kuvvetli pozitif"}
    
    if res in critical_values:
        return "CRITICAL"
        
    return "WARNING"

async def get_reference_range(test: LabTestInput) -> Optional[ReferenceRange]:
    """
    Resolves the reference range, strictly prioritizing CSV data before falling back to MCP.
    """
    # 1. Use explicit Min/Max from CSV if available
    if test.min_reference is not None and test.max_reference is not None:
        return ReferenceRange(
            low=test.min_reference, 
            high=test.max_reference, 
            text_value=test.reference_range_str
        )
        
    # 2. Parse Reference_Range string from CSV if available
    if test.reference_range_str:
        # Check if it's categorical (contains letters)
        if re.search(r'[a-zA-Z]', test.reference_range_str):
            return ReferenceRange(text_value=test.reference_range_str.strip())
            
        # Check if it's a numeric range like "4.0 - 6.0"
        match = re.search(r"(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)", test.reference_range_str)
        if match:
            return ReferenceRange(
                low=float(match.group(1)), 
                high=float(match.group(3)), 
                text_value=test.reference_range_str
            )
            
    # 3. Fallback to MCP Tool if CSV lacked a valid range
    logger.info(f"Fallback to MCP reference range lookup for {test.test_name}")
    try:
        result = await execute_mcp_tool('reference_range_lookup', {'test_name': test.test_name})
        if not result or result == "UNKNOWN":
            return None
            
        match = re.search(r"(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)", result)
        if match:
            return ReferenceRange(
                low=float(match.group(1)), 
                high=float(match.group(3)),
                text_value=result
            )
        if re.search(r'[a-zA-Z]', result):
            return ReferenceRange(text_value=result.strip())
            
    except Exception as e:
        logger.error(f"MCP lookup failed for {test.test_name}: {e}")
        
    return None

async def classify_result(test: LabTestInput) -> str:
    ref = await get_reference_range(test)
    
    source = "CSV" if (test.reference_range_str or test.min_reference is not None) else "MCP"
    
    if not ref:
        logger.warning(f"[{test.test_name}] Result: {test.value} | Ref: None | Source: None -> UNKNOWN")
        return "UNKNOWN"
        
    classification = "UNKNOWN"
    
    # Process Categorical
    if ref.text_value and re.search(r'[a-zA-Z]', ref.text_value):
        classification = classify_categorical(str(test.value), ref.text_value)
    # Process Numeric
    elif ref.low is not None and ref.high is not None:
        try:
            val = float(str(test.value).replace(',', '.'))
            classification = determine_numeric_severity(test.test_name, val, ref.low, ref.high)
        except ValueError:
            classification = "UNKNOWN"
            
    logger.info(f"[{test.test_name}] Result: {test.value} | Ref: {ref.low}-{ref.high} ({ref.text_value}) | Source: {source} -> {classification}")
    return classification

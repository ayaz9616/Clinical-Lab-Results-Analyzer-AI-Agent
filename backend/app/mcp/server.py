from mcp.server.fastmcp import FastMCP

# Create the MCP server
mcp = FastMCP("Clinical Lab MCP")

EXTENDED_RANGES = {
    "Hemoglobin": {"low": 12.0, "high": 15.0, "unit": "g/dL"},
    "Ferritin": {"low": 15.0, "high": 150.0, "unit": "ug/L"},
    "Glikozile Hemoglobin (HbA1c)": {"low": 4.0, "high": 6.0, "unit": "%"},
    "Vitamin D": {"low": 30.0, "high": 100.0, "unit": "ng/mL"},
    "Calcium": {"low": 8.5, "high": 10.5, "unit": "mg/dL"},
}

@mcp.tool()
def reference_range_lookup(test_name: str) -> str:
    """Lookup the clinical reference range for a specific laboratory test.
    
    Args:
        test_name: The name of the laboratory test (e.g. 'Hemoglobin').
    """
    if test_name in EXTENDED_RANGES:
        range_data = EXTENDED_RANGES[test_name]
        return f"Reference range for {test_name}: {range_data['low']} - {range_data['high']} {range_data['unit']}"
    return f"Reference range for {test_name} is not available in the MCP database."

@mcp.tool()
def clinical_context_lookup(test_name: str) -> str:
    """Provides high-level clinical context for a specific laboratory test.
    
    Args:
        test_name: The name of the laboratory test.
    """
    context_db = {
        "Hemoglobin": "Hemoglobin measures the amount of oxygen-carrying protein in the blood.",
        "Ferritin": "Ferritin measures the level of iron stored in the body.",
        "Glikozile Hemoglobin (HbA1c)": "HbA1c reflects average blood sugar levels over the past 2-3 months.",
    }
    return context_db.get(test_name, f"No specific clinical context available for {test_name}.")

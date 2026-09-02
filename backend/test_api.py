import requests
import json
import time

URL = "http://127.0.0.1:8000/analyze_labs"
headers = {"Content-Type": "application/json"}

def test_case(name, data):
    print(f"\n--- Testing {name} ---")
    start = time.time()
    try:
        response = requests.post(URL, headers=headers, json=data)
        response.raise_for_status()
        results = response.json()
        print(f"Status Code: {response.status_code} | Time: {time.time() - start:.2f}s")
        for res in results:
            ref = res.get('reference_range', 'None')
            print(f"[{res['classification']}] {res['test_name']}: {res['value']} {res['unit']} (Ref: {ref})")
            print(f"Explanation: {res['explanation'][:100]}...")
    except Exception as e:
        print(f"FAILED: {e}")

# A. Manual Normal
test_case("Manual Normal", {
    "labs": [{"test_name": "Glukoz", "value": 90.0, "unit": "mg/dL", "min_reference": 70.0, "max_reference": 100.0}]
})

# B. Manual Critical
test_case("Manual Critical", {
    "labs": [{"test_name": "Glukoz", "value": 280.0, "unit": "mg/dL", "min_reference": 70.0, "max_reference": 100.0}]
})

# C. CSV with multiple rows (Normal, Warning, Critical)
test_case("Multiple Rows", {
    "labs": [
        {"test_name": "Glukoz", "value": 90.0, "unit": "mg/dL", "min_reference": 70.0, "max_reference": 100.0},
        {"test_name": "Ferritin", "value": 12.0, "unit": "ng/mL", "min_reference": 15.0, "max_reference": 150.0},
        {"test_name": "Glukoz", "value": 280.0, "unit": "mg/dL", "min_reference": 70.0, "max_reference": 100.0}
    ]
})

# D. Missing reference range (forces MCP)
test_case("Missing Ref Range (MCP)", {
    "labs": [{"test_name": "Bilirubin", "value": 1.5, "unit": "mg/dL"}]
})

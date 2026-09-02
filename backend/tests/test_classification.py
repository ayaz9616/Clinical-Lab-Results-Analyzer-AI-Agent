import pytest
from app.services.classification import determine_numeric_severity, classify_categorical

def test_numeric_severity():
    # 82.5 vs 15-150 -> NORMAL
    assert determine_numeric_severity("Ferritin", 82.5, 15.0, 150.0) == "NORMAL"
    
    # 12 vs 15-150 -> WARNING
    assert determine_numeric_severity("Ferritin", 12.0, 15.0, 150.0) == "WARNING"
    
    # 280 vs 70-100 -> CRITICAL
    assert determine_numeric_severity("Glukoz", 280.0, 70.0, 100.0) == "CRITICAL"
    
    # 5.4 vs 4-6 -> NORMAL
    assert determine_numeric_severity("Glikozile Hemoglobin (HbA1c)", 5.4, 4.0, 6.0) == "NORMAL"
    
    # 6.2 vs 4-6 -> WARNING
    assert determine_numeric_severity("Glikozile Hemoglobin (HbA1c)", 6.2, 4.0, 6.0) == "WARNING"

    # 55 vs 150-450 -> CRITICAL
    assert determine_numeric_severity("Trombosit", 55.0, 150.0, 450.0) == "CRITICAL"

    # 7.8 vs 12-15 -> CRITICAL
    assert determine_numeric_severity("Hemoglobin", 7.8, 12.0, 15.0) == "CRITICAL"

    # 0.35 vs 0.87-1.7 -> CRITICAL
    assert determine_numeric_severity("Serbest T4", 0.35, 0.87, 1.7) == "CRITICAL"


def test_categorical_severity():
    # Negatif, Negatif -> NORMAL
    assert classify_categorical("Negatif", "Negatif") == "NORMAL"
    
    # 1+, Negatif -> WARNING
    assert classify_categorical("1+", "Negatif") == "WARNING"
    
    # Pozitif, Negatif -> WARNING
    assert classify_categorical("Pozitif", "Negatif") == "WARNING"
    
    # 3+, Negatif -> CRITICAL
    assert classify_categorical("3+", "Negatif") == "CRITICAL"
    
    # 2+, Negatif -> CRITICAL
    assert classify_categorical("2+", "Negatif") == "CRITICAL"
    
    # strong positive, Negatif -> CRITICAL
    assert classify_categorical("strong positive", "Negatif") == "CRITICAL"

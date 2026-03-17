#!/usr/bin/env python3
"""
System Validation Script
Checks if all components are properly installed and functioning
"""

import sys
import os
import json
import subprocess
from pathlib import Path

def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def check_python_version():
    """Check Python version"""
    print("1. Python Version Check")
    version = sys.version_info
    print(f"   Python {version.major}.{version.minor}.{version.micro}")
    if version.major >= 3 and version.minor >= 9:
        print("   ✓ PASS")
        return True
    else:
        print("   ✗ FAIL - Requires Python 3.9+")
        return False

def check_python_packages():
    """Check required Python packages"""
    print("\n2. Python Packages Check")
    required = ['fastapi', 'uvicorn', 'pandas', 'numpy', 'sklearn']
    missing = []
    
    for package in required:
        try:
            __import__(package if package != 'sklearn' else 'sklearn')
            print(f"   ✓ {package}")
        except ImportError:
            print(f"   ✗ {package} - NOT INSTALLED")
            missing.append(package)
    
    if not missing:
        print("   ✓ PASS - All packages installed")
        return True
    else:
        print(f"   ✗ FAIL - Missing: {', '.join(missing)}")
        return False

def check_data_files():
    """Check if data files exist"""
    print("\n3. Data Files Check")
    data_dir = Path("backend/data")
    
    required_files = [
        "ocp_synthetic_data.csv",
        "pcmci_results.json",
        "anomaly_results.json",
        "q_table.pkl"
    ]
    
    found = []
    missing = []
    
    for file in required_files:
        path = data_dir / file
        if path.exists():
            size = path.stat().st_size / 1024  # KB
            print(f"   ✓ {file} ({size:.1f} KB)")
            found.append(file)
        else:
            print(f"   ✗ {file} - NOT FOUND")
            missing.append(file)
    
    if not missing:
        print(f"   ✓ PASS - All {len(found)} files present")
        return True
    else:
        print(f"   ✗ FAIL - Missing {len(missing)} files")
        return False

def check_backend_structure():
    """Check backend file structure"""
    print("\n4. Backend Structure Check")
    required = [
        "backend/src/__init__.py",
        "backend/src/data_generator.py",
        "backend/src/preprocessing.py",
        "backend/src/pcmci_analysis.py",
        "backend/src/anomaly_detection.py",
        "backend/src/rl_agent.py",
        "backend/src/config.py",
        "backend/api.py",
        "backend/dash_app.py",
    ]
    
    found = 0
    missing = []
    
    for file in required:
        if Path(file).exists():
            print(f"   ✓ {file}")
            found += 1
        else:
            print(f"   ✗ {file} - NOT FOUND")
            missing.append(file)
    
    if not missing:
        print(f"   ✓ PASS - All {found} files present")
        return True
    else:
        print(f"   ✗ FAIL - Missing {len(missing)} files")
        return False

def check_frontend_structure():
    """Check frontend file structure"""
    print("\n5. Frontend Structure Check")
    required = [
        "app/page.tsx",
        "app/layout.tsx",
        "app/pcmci/page.tsx",
        "app/anomalies/page.tsx",
        "app/rl-strategy/page.tsx",
        "app/insights/page.tsx",
        "app/api/summary/route.ts",
        "app/api/pcmci/route.ts",
    ]
    
    found = 0
    missing = []
    
    for file in required:
        if Path(file).exists():
            print(f"   ✓ {file}")
            found += 1
        else:
            print(f"   ✗ {file} - NOT FOUND")
            missing.append(file)
    
    if not missing:
        print(f"   ✓ PASS - All {found} files present")
        return True
    else:
        print(f"   ✗ FAIL - Missing {len(missing)} files")
        return False

def check_data_integrity():
    """Check if data files are valid"""
    print("\n6. Data Integrity Check")
    
    try:
        import pandas as pd
        df = pd.read_csv("backend/data/ocp_synthetic_data.csv")
        print(f"   ✓ Data loaded: {len(df)} rows × {len(df.columns)} columns")
        
        with open("backend/data/pcmci_results.json") as f:
            pcmci = json.load(f)
            print(f"   ✓ PCMCI: {len(pcmci.get('links', []))} causal links")
        
        with open("backend/data/anomaly_results.json") as f:
            anomaly = json.load(f)
            print(f"   ✓ Anomalies: {len(anomaly.get('ensemble_anomalies', []))} detected")
        
        print("   ✓ PASS - All data files valid")
        return True
    except Exception as e:
        print(f"   ✗ FAIL - {str(e)}")
        return False

def check_api_endpoints():
    """Check if API endpoints are defined"""
    print("\n7. API Endpoints Check")
    
    try:
        with open("backend/api.py") as f:
            content = f.read()
        
        endpoints = [
            ("/health", "health check"),
            ("/api/summary", "system summary"),
            ("/api/pcmci", "causal analysis"),
            ("/api/anomalies", "anomaly detection"),
            ("/api/rl_strategy", "Q-Learning metrics"),
        ]
        
        for route, desc in endpoints:
            if route in content:
                print(f"   ✓ {route} - {desc}")
            else:
                print(f"   ✗ {route} - NOT FOUND")
        
        print("   ✓ PASS - All endpoints defined")
        return True
    except Exception as e:
        print(f"   ✗ FAIL - {str(e)}")
        return False

def run_summary():
    """Summary of all checks"""
    print_header("SYSTEM VALIDATION SUMMARY")
    
    checks = [
        ("Python Version", check_python_version()),
        ("Python Packages", check_python_packages()),
        ("Data Files", check_data_files()),
        ("Backend Structure", check_backend_structure()),
        ("Frontend Structure", check_frontend_structure()),
        ("Data Integrity", check_data_integrity()),
        ("API Endpoints", check_api_endpoints()),
    ]
    
    passed = sum(1 for _, result in checks if result)
    total = len(checks)
    
    print("\nValidation Results:")
    for name, result in checks:
        status = "✓" if result else "✗"
        print(f"  {status} {name}")
    
    print(f"\n{'='*60}")
    print(f"  TOTAL: {passed}/{total} checks passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print("✓ SYSTEM READY FOR USE")
        print("\nNext steps:")
        print("  1. Start backend: cd backend && python api.py")
        print("  2. Start frontend: pnpm dev (in another terminal)")
        print("  3. Open dashboard: http://localhost:3000")
        return 0
    else:
        print("✗ SYSTEM VALIDATION FAILED")
        print("\nFix issues above and re-run this script")
        return 1

if __name__ == "__main__":
    print_header("OCP ENERGY ANOMALY DETECTION SYSTEM")
    print("System Validation Script v1.0")
    
    sys.exit(run_summary())

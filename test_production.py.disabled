import requests
import json
import sys
import os

BASE_URL = "http://localhost:8000"

def test_endpoint(name, path, method="GET", body=None, headers=None):
    print(f"Testing {name} ({path})...", end=" ")
    try:
        url = f"{BASE_URL}{path}"
        h = headers or {}
        if method == "GET":
            r = requests.get(url, timeout=5, headers=h)
        else:
            r = requests.post(url, json=body, timeout=5, headers=h)
        
        if r.status_code < 400:
            print("✅ PASS")
            # print(f"   Response: {r.text[:100]}")
            return True
        else:
            print(f"❌ FAIL ({r.status_code})")
            print(f"   Response: {r.text[:100]}")
            return False
    except Exception as e:
        print(f"💥 ERROR: {str(e)}")
        return False

def run_all_tests():
    success = True
    
    # Core API
    success &= test_endpoint("API Root", "/api/")
    success &= test_endpoint("API Health", "/api/health")
    
    # SLA113 Admin Universe (requires admin role usually, but let's see)
    # Based on server.py: api_router.include_router(admin_universe_router)
    # admin_universe_router prefix is /admin/universe
    # So full path is /api/admin/universe/...
    success &= test_endpoint("Admin Universe Voice", "/api/admin/universe/voice")
    success &= test_endpoint("Admin Universe Engines", "/api/admin/universe/engines")
    
    # SLA113 Hybrid Brain
    # Based on server.py: api_router.include_router(hybrid_router)
    # Let's check hybrid_router prefix in routers/sla113/hybrid/__init__.py
    success &= test_endpoint("Hybrid Engines Status", "/api/sla113/hybrid/engines/status")
    
    # Empire One Billing (Public)
    success &= test_endpoint("Billing Public", "/api/billing/public/info")
    
    return success

if __name__ == "__main__":
    run_all_tests()
    print("\nBackend Verification Complete.")

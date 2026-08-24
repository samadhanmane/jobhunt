"""
Automated unit & integration test for:
1. Security Headers Injection (X-Frame-Options, X-Content-Type-Options, etc.)
2. Anti-DDoS Request Size Limiter (>15MB rejects with 413)
3. Sliding-Window Rate Limiter (Rejects excessive requests with 429 & Retry-After)
"""
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import app

client = TestClient(app)

def test_security_headers():
    print("\n--- 1. Testing Security Headers Middleware ---")
    response = client.get("/")
    assert response.status_code == 200
    headers = response.headers

    print(f"X-Content-Type-Options: {headers.get('x-content-type-options')}")
    assert headers.get("x-content-type-options") == "nosniff"

    print(f"X-Frame-Options: {headers.get('x-frame-options')}")
    assert headers.get("x-frame-options") == "DENY"

    print(f"X-XSS-Protection: {headers.get('x-xss-protection')}")
    assert headers.get("x-xss-protection") == "1; mode=block"

    print(f"Referrer-Policy: {headers.get('referrer-policy')}")
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    print("[PASSED] Security Headers Successfully Verified!")

def test_request_size_limit():
    print("\n--- 2. Testing Anti-DDoS Request Size Limiter ---")
    # Simulate an oversized request header
    headers = {"Content-Length": str(20 * 1024 * 1024)} # 20 MB
    response = client.post("/api/v1/auth/login", headers=headers, json={"email": "a", "password": "b"})
    print(f"Oversized Request Status: {response.status_code}, Body: {response.json()}")
    assert response.status_code == 413
    assert response.json().get("error") == "Payload Too Large"
    print("[PASSED] Oversized Payload Rejection (413) Verified!")

def test_rate_limiting():
    print("\n--- 3. Testing Sliding-Window Rate Limiter ---")
    # Exceed login rate limit (10 reqs / min)
    triggered_429 = False
    for i in range(15):
        resp = client.post("/api/v1/auth/login", json={"email": "spam@test.com", "password": "wrong"})
        if resp.status_code == 429:
            print(f"Request #{i+1} received 429 Too Many Requests!")
            print(f"Retry-After header: {resp.headers.get('Retry-After')}")
            print(f"Response: {resp.json()}")
            triggered_429 = True
            break

    assert triggered_429 is True, "Rate limiter did not trigger 429 on rapid request burst!"
    print("[PASSED] Rate Limiting (429 Too Many Requests) Successfully Verified!")

if __name__ == "__main__":
    test_security_headers()
    test_request_size_limit()
    test_rate_limiting()
    print("\n[SUCCESS] All Security & Rate Limiting Tests Passed!")

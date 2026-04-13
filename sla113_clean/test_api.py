import requests

BASE_URL = "http://localhost:8080"

def test_health():
    resp = requests.get(f"{BASE_URL}/")
    print("Health check:", resp.json())

def test_soulfire():
    payload = {"prompt": "Generate a Chicano Soul track with late-pocket rhythm"}
    resp = requests.post(f"{BASE_URL}/api/soulfire/generate-music", params=payload)
    print("Soulfire response:", resp.json())

if __name__ == "__main__":
    test_health()
    # Uncomment below to test soulfire endpoint (requires Vertex AI credentials)
    # test_soulfire()

import os
import requests
import json

# Azure endpoint and API key — use env vars, never hardcode secrets
AZURE_ENDPOINT = os.environ.get(
    "AZURE_ENDPOINT",
    "https://empire1-sla113-core-resource.services.ai.azure.com/api/projects/empire1-sla113-core",
)
API_KEY = os.environ.get("AZURE_API_KEY", "")

# File to upload
CANON_FILE_PATH = "/root/Southern_Lifestyle_Canon.yaml"

# Function to upload file to Azure
def upload_to_azure():
    # Read the Canon file
    try:
        with open(CANON_FILE_PATH, "r") as file:
            canon_data = file.read()
    except FileNotFoundError:
        print("Error: Canon file not found.")
        return
    
    # Convert YAML to JSON (if required)
    try:
        import yaml
        canon_json = json.dumps(yaml.safe_load(canon_data))
    except Exception as e:
        print("Error converting YAML to JSON:", str(e))
        return

    # Set headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    # Send POST request
    response = requests.post(AZURE_ENDPOINT, headers=headers, data=canon_json)

    # Handle the response
    if response.status_code == 200:
        print("Success: Canon file uploaded to Azure.")
        print("Response:", response.json())
    else:
        print(f"Error: Azure API responded with status code {response.status_code}.")
        print("Response:", response.text)

if __name__ == "__main__":
    upload_to_azure()
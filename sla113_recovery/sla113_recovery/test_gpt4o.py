from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

# Your Azure AI Project endpoint
myEndpoint = "https://empire1-sla113-core-resource.services.ai.azure.com/api/projects/empire1-sla113-core"

# Create the project client
project_client = AIProjectClient(
    endpoint=myEndpoint,
    credential=DefaultAzureCredential(),
)

# Your agent name and version
myAgent = "sla113-core"
myVersion = "4"

# Get the OpenAI-compatible client inside the project
openai_client = project_client.get_openai_client()

# Send a test message to your agent
response = openai_client.responses.create(
    input=[{"role": "user", "content": "SLA113 online?"}],
    extra_body={
        "agent_reference": {
            "name": myAgent,
            "version": myVersion,
            "type": "agent_reference"
        }
    },
)

print(f"Response output: {response.output_text}")

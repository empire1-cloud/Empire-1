import axios from "axios";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const key = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

async function run() {
  const response = await axios.post(
    `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
    {
      messages: [{ role: "user", content: "Say hi from Azure GPT‑4o." }]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": key
      }
    }
  );

  console.log(response.data.choices[0].message.content);
}

run();

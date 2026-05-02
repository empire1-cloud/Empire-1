const axios = require('axios');
require('dotenv').config({ path: '/root/backend/.env' }); // Load the .env file

const apiKey = process.env.AZURE_OPENAI_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;
const url = `${endpoint}/openai/deployments/${deploymentName}/completions?api-version=${apiVersion}`;

async function run() {
  try {
    const response = await axios.post(
      url,
      {
        prompt: "Say hi from Azure GPT-4o!",
        max_tokens: 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );
    console.log("Azure GPT-4o Response:", response.data.choices[0].text);
  } catch (error) {
    console.error("Error connecting to Azure GPT-4o:", error.response ? error.response.data : error.message);
  }
}

run();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function run() {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "user", content: "Hello GPT‑4o, say hi." }
    ]
  });

  console.log(response.choices[0].message.content);
}

run();

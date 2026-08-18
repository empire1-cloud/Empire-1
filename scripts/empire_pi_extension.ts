import type { ExtensionAPI, ProviderModelConfig } from "@earendil-works/pi-coding-agent";

const API_KEY_ENV = "EMPIRE_PI_API_KEY";
const BASE_URL_ENV = "EMPIRE_PI_BASE_URL";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function models(baseUrl: string, apiKey: string): Promise<ProviderModelConfig[]> {
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) throw new Error(`Empire-1 model catalog returned HTTP ${response.status}`);
  const payload = await response.json() as { data?: Array<{ id?: string }> };
  const ids = (payload.data ?? []).map((item) => item.id).filter((id): id is string => Boolean(id));
  if (!ids.length) throw new Error("Empire-1 Router has no configured models");
  return ids.map((id) => ({
    id,
    name: id,
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 16384,
  }));
}

export default async function empireOne(pi: ExtensionAPI): Promise<void> {
  const baseUrl = required(BASE_URL_ENV).replace(/\/+$/, "");
  const apiKey = required(API_KEY_ENV);
  pi.registerProvider("empire-1", {
    name: "Empire-1 Router",
    baseUrl,
    apiKey: `$${API_KEY_ENV}`,
    authHeader: true,
    api: "anthropic-messages",
    models: await models(baseUrl, apiKey),
  });
}

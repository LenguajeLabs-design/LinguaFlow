import OpenAI from "openai";

const deepseekKey = process.env.Deepseek;

if (!deepseekKey && (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || !process.env.AI_INTEGRATIONS_OPENAI_API_KEY)) {
  throw new Error("No AI provider configured — set Deepseek or the Replit AI integration env vars");
}

export const openai = deepseekKey
  ? new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: deepseekKey,
    })
  : new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL!,
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY!,
    });

export const MODEL = deepseekKey ? "deepseek-chat" : "gpt-5.2";

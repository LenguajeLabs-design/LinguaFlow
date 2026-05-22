import OpenAI from "openai";

const openaiKey = process.env.OpenAI;
const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

if (!openaiKey && (!replitBase || !replitKey)) {
  throw new Error("No AI provider configured — set OpenAI or the Replit AI integration env vars");
}

const openaiClient = openaiKey
  ? new OpenAI({ apiKey: openaiKey })
  : null;

const replitClient = replitBase && replitKey
  ? new OpenAI({ baseURL: replitBase, apiKey: replitKey })
  : null;

export const openai = (openaiClient ?? replitClient)!;
export const MODEL = openaiClient ? "gpt-4o" : "gpt-5.2";

type ChatParams = Parameters<OpenAI["chat"]["completions"]["create"]>[0];

export async function chatWithFallback(params: ChatParams): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  if (openaiClient) {
    try {
      return await openaiClient.chat.completions.create({
        ...params,
        model: "gpt-4o",
      }) as OpenAI.Chat.Completions.ChatCompletion;
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 402 || status === 401 || status === 429) {
        console.warn(`OpenAI returned ${status}, falling back to Replit AI proxy`);
        if (!replitClient) throw err;
        return await replitClient.chat.completions.create({
          ...params,
          model: "gpt-5.2",
        }) as OpenAI.Chat.Completions.ChatCompletion;
      }
      throw err;
    }
  }
  return await replitClient!.chat.completions.create(params) as OpenAI.Chat.Completions.ChatCompletion;
}

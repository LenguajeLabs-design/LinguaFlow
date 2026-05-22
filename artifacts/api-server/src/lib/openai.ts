import OpenAI from "openai";

const deepseekKey = process.env.Deepseek;
const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

if (!deepseekKey && (!replitBase || !replitKey)) {
  throw new Error("No AI provider configured — set Deepseek or the Replit AI integration env vars");
}

const deepseekClient = deepseekKey
  ? new OpenAI({ baseURL: "https://api.deepseek.com", apiKey: deepseekKey })
  : null;

const replitClient = replitBase && replitKey
  ? new OpenAI({ baseURL: replitBase, apiKey: replitKey })
  : null;

export const openai = (deepseekClient ?? replitClient)!;
export const MODEL = deepseekClient ? "deepseek-chat" : "gpt-5.2";

type ChatParams = Parameters<OpenAI["chat"]["completions"]["create"]>[0];

export async function chatWithFallback(params: ChatParams): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  if (deepseekClient) {
    try {
      return await deepseekClient.chat.completions.create({
        ...params,
        model: "deepseek-chat",
      }) as OpenAI.Chat.Completions.ChatCompletion;
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 402 || status === 401 || status === 429) {
        console.warn(`DeepSeek returned ${status}, falling back to Replit AI proxy`);
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

import { Router } from "express";
import { openai } from "../lib/openai";
import { requireAuth } from "../middleware/requireAuth";
import { ttsLimiter } from "../middleware/rateLimiter";

const router = Router();

const VOICE_CONFIG: Record<string, { voice: string; instructions: string }> = {
  ko: {
    voice: "nova",
    instructions:
      "Speak in natural, warm Korean. Use a conversational, native-sounding pace — not too fast, not too slow. Pronounce every syllable clearly with natural Korean intonation and rhythm. Avoid sounding robotic or overly formal.",
  },
  zh: {
    voice: "nova",
    instructions:
      "Speak in natural, clear Mandarin Chinese with standard Putonghua pronunciation. Use a warm, conversational tone with natural rhythm and intonation. Pronounce tones accurately and clearly.",
  },
  es: {
    voice: "nova",
    instructions:
      "Speak in natural, warm Latin American Spanish. Use a clear, conversational pace with authentic Spanish rhythm and intonation. Pronounce all vowels crisply, roll your r's naturally, and stress syllables correctly. Sound like an educated native speaker — warm and expressive, not robotic.",
  },
};

router.post("/tts", requireAuth, ttsLimiter, async (req, res) => {
  const { text, language } = req.body as { text?: string; language?: string };

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const lang = language === "zh" ? "zh" : language === "es" ? "es" : "ko";
  const { voice, instructions } = VOICE_CONFIG[lang];

  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voice as "nova",
      input: text.slice(0, 4096),
      response_format: "mp3",
      instructions,
    } as Parameters<typeof openai.audio.speech.create>[0]);

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (err: any) {
    console.error("TTS error:", err?.message ?? err);
    res.status(500).json({ error: "TTS generation failed" });
  }
});

export default router;

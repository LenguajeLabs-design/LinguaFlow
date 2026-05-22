import { Router } from "express";
import { openai } from "../lib/openai";

const router = Router();

router.post("/tts", async (req, res) => {
  const { text, language } = req.body as { text?: string; language?: string };

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  try {
    const voice = language === "zh" ? "nova" : "alloy";

    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice,
      input: text.slice(0, 4096),
      response_format: "mp3",
    });

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

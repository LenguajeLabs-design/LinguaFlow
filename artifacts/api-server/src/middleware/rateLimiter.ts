import rateLimit from "express-rate-limit";

const json429 = (_req: any, res: any) => {
  res.status(429).json({ error: "Too many requests. Please wait and try again." });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  message: "Generation limit reached. You can generate up to 20 passages per hour.",
});

export const glossLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

export const ttsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

import { chatWithFallback, MODEL } from "./openai";

export interface ChineseToken {
  hanzi: string;
  pinyin: string;
  meaning: string;
  type: "word" | "punct";
}

export interface ChineseSentence {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface ChineseVocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface GeneratedChinesePassage {
  title: string;
  summary: string;
  chineseText: string;
  tokens: ChineseToken[];
  sentences: ChineseSentence[];
  vocabulary: ChineseVocabItem[];
  comprehensionQuestions: Array<{ question: string; answer: string }>;
  imageUrls: string[];
}

const hskProfiles: Record<string, {
  hskLevel: string;
  wordCount: string;
  sentenceGuidance: string;
  vocabularyGuidance: string;
  grammarGuidance: string;
}> = {
  hsk1: {
    hskLevel: "HSK Level 1",
    wordCount: "150 most common words",
    sentenceGuidance:
      "Use only very short sentences (4–8 characters each). Subject-verb or subject-verb-object only. " +
      "Present tense primarily. Use basic pronouns 我, 你, 他, 她. Avoid all complex structures.",
    vocabularyGuidance:
      "Only the 150 most common HSK 1 words. Concrete nouns (人, 水, 书, 家), basic verbs (是, 有, 去, 来, 吃, 喝, 看), " +
      "common adjectives (大, 小, 好, 多). Absolutely no idioms or slang.",
    grammarGuidance:
      "Basic SVO sentences. Question words: 什么, 哪, 谁, 怎么. " +
      "Basic 是...的 structure. Simple negation with 不.",
  },
  hsk2: {
    hskLevel: "HSK Level 2",
    wordCount: "300 most common words",
    sentenceGuidance:
      "Short sentences (6–12 characters). Simple compound sentences with 和, 也. " +
      "Basic past with 了, future with 要/会. Simple comparisons.",
    vocabularyGuidance:
      "HSK 1-2 vocabulary range (300 words). Common everyday words. " +
      "Basic measure words (个, 本, 杯, 张). Simple time words (今天, 明天, 昨天).",
    grammarGuidance:
      "Aspect marker 了 (completed action). 把 structure avoided. " +
      "Simple 比 comparisons. 因为...所以... for simple cause-effect.",
  },
  hsk3: {
    hskLevel: "HSK Level 3",
    wordCount: "600 words",
    sentenceGuidance:
      "Medium sentences (8–16 characters). Mix of simple and compound sentences. " +
      "Some clause structures with 的, 地, 得. Natural rhythm.",
    vocabularyGuidance:
      "HSK 1-3 vocabulary range (600 words). Some abstract nouns and adjectives. " +
      "More varied verbs and adverbs. Topic-relevant vocabulary.",
    grammarGuidance:
      "Complement of degree (得). Direction complements. 把 structure for common usage. " +
      "还是/或者 for alternatives. 虽然...但是... for contrast.",
  },
  hsk4: {
    hskLevel: "HSK Level 4",
    wordCount: "1,200 words",
    sentenceGuidance:
      "Varied sentence lengths (10–25 characters). Complex structures allowed. " +
      "Discourse connectives (然后, 因此, 另外). Natural flow.",
    vocabularyGuidance:
      "HSK 1-4 vocabulary range (1,200 words). More formal vocabulary. " +
      "4-character phrases appropriate for the topic. Some idiomatic usage.",
    grammarGuidance:
      "Passive voice 被. Potential complements 不了/得了. " +
      "Expressing purpose with 为了. Complex 把 structures. " +
      "Correlative conjunctions 既然...就..., 只要...就...",
  },
  hsk5: {
    hskLevel: "HSK Level 5",
    wordCount: "2,500 words",
    sentenceGuidance:
      "Natural Chinese prose with varied rhythm. Longer flowing sentences where appropriate. " +
      "Sophisticated discourse with topic development. Mix of formal/informal registers.",
    vocabularyGuidance:
      "HSK 1-5 vocabulary range (2,500 words). Formal Sino-vocabulary, literary expressions, " +
      "4-character idioms (成语) appropriate to context. Nuanced word choices.",
    grammarGuidance:
      "Full grammar range including literary patterns. Advanced complement structures. " +
      "Classical Chinese-influenced expressions where natural. Stylistic variety.",
  },
  hsk6: {
    hskLevel: "HSK Level 6",
    wordCount: "5,000+ words",
    sentenceGuidance:
      "Sophisticated literary or journalistic Chinese. Long, flowing sentences where appropriate. " +
      "Complex discourse structure with elegant transitions. Native speaker register.",
    vocabularyGuidance:
      "Full vocabulary range including literary expressions, classical references, " +
      "technical vocabulary, proverbs (谚语/俗语), and nuanced register distinctions.",
    grammarGuidance:
      "Full grammar including classical patterns, complex rhetoric devices, " +
      "parallel structures, and sophisticated aspectual distinctions.",
  },
};

const lengthMap: Record<string, { sentences: string; chars: string; maxTokens: number }> = {
  short:  { sentences: "8–12 sentences",  chars: "130–200 Chinese characters",    maxTokens: 4000  },
  medium: { sentences: "15–20 sentences", chars: "280–400 Chinese characters",    maxTokens: 8000  },
  long:   { sentences: "25–35 sentences", chars: "500–700 Chinese characters",    maxTokens: 12000 },
};

const styleMap: Record<string, string> = {
  story:      "a short narrative story with a clear beginning, middle, and end",
  article:    "an informative article or essay with a clear topic sentence",
  dialogue:   "a realistic conversation between two or more people, formatted naturally",
  reflection: "a personal reflection or journal entry written in first person",
  summary:    "a concise informational summary about the topic",
};


function getFallbackChinesePassage(input: { difficulty: string; topic: string }): GeneratedChinesePassage {
  return {
    title: "咖啡馆 | At the Coffee Shop",
    summary: "A short story about visiting a coffee shop in China.",
    chineseText: "我去咖啡馆。我喝咖啡。咖啡很好喝。我很高兴。",
    tokens: [
      { hanzi: "我", pinyin: "wǒ", meaning: "I/me", type: "word" },
      { hanzi: "去", pinyin: "qù", meaning: "go", type: "word" },
      { hanzi: "咖啡馆", pinyin: "kāfēiguǎn", meaning: "coffee shop", type: "word" },
      { hanzi: "。", pinyin: "", meaning: "", type: "punct" },
      { hanzi: "我", pinyin: "wǒ", meaning: "I/me", type: "word" },
      { hanzi: "喝", pinyin: "hē", meaning: "drink", type: "word" },
      { hanzi: "咖啡", pinyin: "kāfēi", meaning: "coffee", type: "word" },
      { hanzi: "。", pinyin: "", meaning: "", type: "punct" },
    ],
    sentences: [
      { chinese: "我去咖啡馆。", pinyin: "Wǒ qù kāfēiguǎn。", english: "I go to the coffee shop." },
      { chinese: "我喝咖啡。", pinyin: "Wǒ hē kāfēi。", english: "I drink coffee." },
      { chinese: "咖啡很好喝。", pinyin: "Kāfēi hěn hǎo hē。", english: "The coffee is very good." },
      { chinese: "我很高兴。", pinyin: "Wǒ hěn gāoxìng。", english: "I am very happy." },
    ],
    vocabulary: [
      { hanzi: "咖啡馆", pinyin: "kāfēiguǎn", meaning: "coffee shop", partOfSpeech: "noun", exampleSentence: "我去咖啡馆。" },
      { hanzi: "咖啡", pinyin: "kāfēi", meaning: "coffee", partOfSpeech: "noun", exampleSentence: "我喝咖啡。" },
      { hanzi: "好喝", pinyin: "hǎo hē", meaning: "delicious (for drinks)", partOfSpeech: "adjective", exampleSentence: "这个茶很好喝。" },
      { hanzi: "高兴", pinyin: "gāoxìng", meaning: "happy, pleased", partOfSpeech: "adjective", exampleSentence: "我很高兴。" },
    ],
    comprehensionQuestions: [
      { question: "他去哪里？", answer: "他去咖啡馆。" },
      { question: "咖啡怎么样？", answer: "咖啡很好喝。" },
      { question: "他心情怎么样？", answer: "他很高兴。" },
    ],
    imageUrls: [],
  };
}

export async function generateChinesePassage(input: {
  topic: string;
  difficulty: string;
  length: string;
  readingStyle: string;
  vocabularyFocus?: string;
  grammarFocus?: string;
}): Promise<GeneratedChinesePassage> {
  const profile = hskProfiles[input.difficulty] ?? hskProfiles.hsk3;
  const lengthSpec = lengthMap[input.length] ?? lengthMap.medium;
  const styleDesc = styleMap[input.readingStyle] ?? styleMap.article;

  const vocabInstruction = input.vocabularyFocus
    ? `Naturally incorporate vocabulary related to: ${input.vocabularyFocus}.`
    : "";
  const grammarInstruction = input.grammarFocus
    ? `Feature and demonstrate these grammar patterns: ${input.grammarFocus}.`
    : "";

  const prompt = `You are a master Chinese language educator specializing in graded readers for adult learners.

Create a ${profile.hskLevel} (${profile.wordCount}) graded reading passage with these exact specifications:

TOPIC: ${input.topic}
STYLE: ${styleDesc}
LENGTH: ${lengthSpec.sentences} (approximately ${lengthSpec.chars})
${vocabInstruction}
${grammarInstruction}

=== LANGUAGE CALIBRATION ===
SENTENCES: ${profile.sentenceGuidance}
VOCABULARY: ${profile.vocabularyGuidance}
GRAMMAR: ${profile.grammarGuidance}

=== WORD SEGMENTATION REQUIREMENT ===
You MUST segment the passage into individual words/tokens. Chinese has no spaces — you must identify word boundaries.
For example: 我喜欢学习中文 → tokens: 我, 喜欢, 学习, 中文
Include punctuation as separate "punct" tokens.

=== CONTENT QUALITY ===
- Make the content genuinely interesting and culturally authentic — NOT like a generic textbook
- Ground the passage in real Chinese culture, places, food, or everyday life
- Each sentence should be pedagogically clear while remaining natural and engaging

Return ONLY a JSON object (no markdown, no code blocks) with EXACTLY this structure:
{
  "title": "Chinese title (2–6 chars) | English subtitle",
  "summary": "One or two sentence English summary of the passage",
  "tokens": [
    { "hanzi": "word", "pinyin": "pīnyīn", "meaning": "English meaning", "type": "word" },
    { "hanzi": "。", "pinyin": "", "meaning": "", "type": "punct" }
  ],
  "sentences": [
    { "chinese": "Full Chinese sentence.", "pinyin": "Full pinyin with tones.", "english": "English translation." }
  ],
  "vocabulary": [
    {
      "hanzi": "word or phrase",
      "pinyin": "toned pinyin",
      "meaning": "primary English meaning",
      "partOfSpeech": "noun | verb | adjective | adverb | particle | measure word | conjunction | expression",
      "exampleSentence": "A simple example sentence in Chinese."
    }
  ],
  "comprehensionQuestions": [
    { "question": "Chinese question?", "answer": "Chinese answer from the passage." }
  ]
}

TOKENS: Every character must appear in a token. Include ALL punctuation as punct tokens.
VOCABULARY: Include exactly 8–12 key words/phrases. Select words that are:
  - High-value for learners at this ${profile.hskLevel} level
  - Actually used in the passage
  - A mix of nouns, verbs, adjectives, and grammar patterns

COMPREHENSION QUESTIONS: Write exactly 3 questions in Chinese that test understanding.`;

  const response = await chatWithFallback({
    model: MODEL,
    max_tokens: lengthSpec.maxTokens,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const parsed = JSON.parse(clean) as {
    title: string;
    summary: string;
    tokens: ChineseToken[];
    sentences: ChineseSentence[];
    vocabulary: ChineseVocabItem[];
    comprehensionQuestions: Array<{ question: string; answer: string }>;
  };

  const PUNCT_TYPES = new Set(["punct", "punctuation", "punc", "symbol"]);
  const normalizeTokens = (tokens: any[]): ChineseToken[] =>
    tokens.map((t) => ({
      ...t,
      type: PUNCT_TYPES.has((t.type ?? "").toLowerCase()) ? "punct" : "word",
    }));

  const chineseText = parsed.tokens.map((t) => t.hanzi).join("");

  return {
    title: parsed.title || `${input.topic} 阅读`,
    summary: parsed.summary || "",
    chineseText,
    tokens: normalizeTokens(parsed.tokens || []),
    sentences: parsed.sentences || [],
    vocabulary: (parsed.vocabulary || []).slice(0, 12),
    comprehensionQuestions: (parsed.comprehensionQuestions || []).slice(0, 3),
    imageUrls: [],
  };
}

export async function glossChineseWord(
  word: string,
  context?: string,
): Promise<{
  word: string;
  romanization: string;
  englishMeaning: string;
  partOfSpeech: string;
  grammarNote?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}> {
  const contextNote = context ? `Context sentence: "${context}"` : "";

  const prompt = `You are a Chinese language expert. Provide a concise gloss for the Chinese word or expression: "${word}"

${contextNote}

Return ONLY valid JSON (no markdown):
{
  "word": "${word}",
  "romanization": "toned pinyin",
  "englishMeaning": "primary English meaning in this context",
  "partOfSpeech": "noun | verb | adjective | adverb | particle | measure word | conjunction | expression",
  "grammarNote": "brief grammar note if relevant (e.g. 了 = aspect marker for completed action). Omit if not needed.",
  "exampleSentence": "simple Chinese example sentence",
  "exampleTranslation": "English translation of the example"
}`;

  const response = await chatWithFallback({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

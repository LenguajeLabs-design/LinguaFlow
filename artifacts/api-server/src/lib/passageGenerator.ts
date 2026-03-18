import { openai } from "./openai";

export interface PassageInput {
  topic: string;
  difficulty: string;
  length: string;
  vocabularyFocus?: string;
  grammarFocus?: string;
  readingStyle: string;
}

export interface Sentence {
  korean: string;
  english: string;
}

export interface VocabularyItem {
  korean: string;
  romanization: string;
  english: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface GeneratedPassage {
  title: string;
  koreanText: string;
  sentences: Sentence[];
  vocabulary: VocabularyItem[];
  imageUrls: string[];
}

const difficultyMap: Record<string, string> = {
  beginner: "TOPIK Level 1 (very simple sentences, basic vocabulary, present tense only)",
  lower_intermediate: "TOPIK Level 2 (simple grammar patterns, common vocabulary, basic past/future tense)",
  intermediate: "TOPIK Level 3 (moderate complexity, some connective endings, mixed tenses)",
  upper_intermediate: "TOPIK Level 4 (complex sentences, formal/informal register variation, idiomatic expressions)",
  advanced: "TOPIK Level 5-6 (sophisticated grammar, literary expressions, complex discourse structure)",
};

const lengthMap: Record<string, string> = {
  short: "3-5 sentences (about 60-100 Korean characters)",
  medium: "7-10 sentences (about 150-200 Korean characters)",
  long: "12-18 sentences (about 250-400 Korean characters)",
};

const styleMap: Record<string, string> = {
  story: "a short narrative story",
  article: "an informative article or essay",
  dialogue: "a realistic conversation between two or more people",
  reflection: "a personal reflection or journal entry in first person",
};

const topicImages: Record<string, string[]> = {
  default: [
    "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
    "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80",
  ],
  "korean cinema": [
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
  ],
  "temple stay": [
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&q=80",
  ],
  "life in seoul": [
    "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
    "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80",
  ],
  "teaching abroad": [
    "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  ],
  "language learning": [
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  ],
  "family life": [
    "https://images.unsplash.com/photo-1511895426328-dc8714191011?w=800&q=80",
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
  ],
  "travel in korea": [
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
    "https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=800&q=80",
  ],
};

function getImagesForTopic(topic: string): string[] {
  const lower = topic.toLowerCase();
  for (const [key, urls] of Object.entries(topicImages)) {
    if (key !== "default" && lower.includes(key.split(" ")[0])) {
      return urls;
    }
  }
  return topicImages.default;
}

export async function generateKoreanPassage(input: PassageInput): Promise<GeneratedPassage> {
  const difficultyDesc = difficultyMap[input.difficulty] || difficultyMap.intermediate;
  const lengthDesc = lengthMap[input.length] || lengthMap.medium;
  const styleDesc = styleMap[input.readingStyle] || styleMap.article;

  const vocabularyInstruction = input.vocabularyFocus
    ? `Include vocabulary related to: ${input.vocabularyFocus}.`
    : "";
  const grammarInstruction = input.grammarFocus
    ? `Feature these grammar patterns: ${input.grammarFocus}.`
    : "";

  const prompt = `You are an expert Korean language educator creating a reading passage for an adult learner.

Create a Korean reading passage with the following specifications:
- Topic: ${input.topic}
- Reading style: ${styleDesc}
- Difficulty level: ${difficultyDesc}
- Length: ${lengthDesc}
${vocabularyInstruction}
${grammarInstruction}

The passage should be genuinely interesting and culturally rich, NOT like a generic textbook. Make it feel real and engaging.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "title": "A short evocative title in Korean (2-6 characters) with English subtitle",
  "sentences": [
    {
      "korean": "Korean sentence here.",
      "english": "English translation here."
    }
  ],
  "vocabulary": [
    {
      "korean": "word",
      "romanization": "romanization",
      "english": "meaning",
      "partOfSpeech": "noun/verb/adjective/adverb/particle/expression",
      "exampleSentence": "Example sentence using the word."
    }
  ]
}

Rules:
- sentences: each sentence is a complete grammatical unit. For dialogues, each speaker turn is one sentence.
- vocabulary: include 8-15 key words/expressions from the passage that are worth studying at this level
- title: format like "서울 생활 | Life in Seoul" (Korean | English)
- Make the Korean authentic and natural, not overly formal or textbook-ish
- Ensure all romanization uses the Revised Romanization of Korean system`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    messages: [
      { role: "user", content: prompt }
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  
  let parsed: { title: string; sentences: Sentence[]; vocabulary: VocabularyItem[] };
  
  try {
    const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  const koreanText = parsed.sentences.map((s) => s.korean).join(" ");
  const imageUrls = getImagesForTopic(input.topic);

  return {
    title: parsed.title || `${input.topic} 읽기`,
    koreanText,
    sentences: parsed.sentences,
    vocabulary: parsed.vocabulary,
    imageUrls,
  };
}

export async function glossKoreanWord(word: string, context?: string, difficulty?: string): Promise<{
  word: string;
  romanization: string;
  englishMeaning: string;
  partOfSpeech: string;
  grammarNote?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}> {
  const contextNote = context ? `Context sentence: "${context}"` : "";
  const levelNote = difficulty ? `Learner level: ${difficulty}` : "";

  const prompt = `You are a Korean language expert. Provide a concise gloss for the Korean word/expression: "${word}"

${contextNote}
${levelNote}

Return ONLY valid JSON (no markdown):
{
  "word": "${word}",
  "romanization": "romanization using Revised Romanization",
  "englishMeaning": "primary English meaning",
  "partOfSpeech": "noun/verb/adjective/adverb/particle/conjunction/expression/suffix",
  "grammarNote": "brief grammar explanation if relevant (e.g., verb ending -아/어서 = because/so)",
  "exampleSentence": "simple Korean example sentence",
  "exampleTranslation": "English translation of example"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

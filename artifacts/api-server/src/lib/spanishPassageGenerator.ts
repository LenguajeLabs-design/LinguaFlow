import { chatWithFallback, MODEL } from "./openai";

export interface SpanishSentence {
  spanish: string;
  english: string;
}

export interface SpanishVocabItem {
  word: string;
  english: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface GeneratedSpanishPassage {
  title: string;
  summary: string;
  spanishText: string;
  sentences: SpanishSentence[];
  vocabulary: SpanishVocabItem[];
  comprehensionQuestions: Array<{ question: string; answer: string }>;
  imageUrls: string[];
}

const cefrProfiles: Record<string, {
  cefrLevel: string;
  wordCount: string;
  sentenceGuidance: string;
  vocabularyGuidance: string;
  grammarGuidance: string;
}> = {
  a1: {
    cefrLevel: "CEFR A1 (Beginner)",
    wordCount: "~500 most common words",
    sentenceGuidance:
      "Use only very short, simple sentences (5–10 words each). " +
      "Present tense (ser, estar, tener, ir) only. Subject-verb-object patterns. " +
      "Avoid subordinate clauses entirely. Use familiar 'tú' address.",
    vocabularyGuidance:
      "Strictly the ~500 most common Spanish words. Concrete everyday nouns (casa, familia, comida, trabajo). " +
      "Basic verbs: ser, estar, tener, ir, comer, hablar, vivir. Simple adjectives: grande, pequeño, bueno, malo. " +
      "No idioms, no slang, no complex vocabulary.",
    grammarGuidance:
      "Present indicative only. Articles (el, la, un, una). " +
      "Gender agreement on adjectives. Negation with 'no'. " +
      "Basic question formation with ¿Qué?, ¿Dónde?, ¿Cuándo?",
  },
  a2: {
    cefrLevel: "CEFR A2 (Elementary)",
    wordCount: "~1,000 most common words",
    sentenceGuidance:
      "Short sentences with occasional compound sentences joined by y, pero, porque. " +
      "Present and preterite tenses. Simple descriptions and narrations of past events.",
    vocabularyGuidance:
      "Common everyday vocabulary (1,000 word range). " +
      "Routine activities, shopping, travel, family, food. " +
      "Basic time expressions (ayer, mañana, siempre). Avoid formal register.",
    grammarGuidance:
      "Present indicative and simple preterite. Immediate future (ir + a + infinitive). " +
      "Basic reflexive verbs (levantarse, llamarse). " +
      "Simple connectives: y, pero, porque, cuando.",
  },
  b1: {
    cefrLevel: "CEFR B1 (Intermediate)",
    wordCount: "~2,000 words",
    sentenceGuidance:
      "Medium-length sentences with clear connective structure. " +
      "Mix of tenses including imperfect and preterite contrast. " +
      "Natural discourse with topic development across sentences.",
    vocabularyGuidance:
      "Broader vocabulary including some abstract nouns and collocations. " +
      "Colloquial but not slangy expressions appropriate to context. " +
      "Topic-relevant vocabulary introduced naturally.",
    grammarGuidance:
      "Full indicative tenses: present, preterite, imperfect, future, conditional. " +
      "Basic subjunctive in fixed expressions (espero que, quiero que). " +
      "Discourse connectives: sin embargo, además, por eso, aunque.",
  },
  b2: {
    cefrLevel: "CEFR B2 (Upper Intermediate)",
    wordCount: "~4,000 words",
    sentenceGuidance:
      "Varied sentence lengths with sophisticated connective structure. " +
      "Complex subordinate clauses. Natural discourse markers and cohesion devices. " +
      "Register variation appropriate to context.",
    vocabularyGuidance:
      "Wide vocabulary range including formal and idiomatic expressions. " +
      "Figurative language used naturally. Academic and cultural vocabulary where fitting. " +
      "Nuanced word choices between near-synonyms.",
    grammarGuidance:
      "Full subjunctive in noun, adjective, and adverbial clauses. " +
      "Passive voice (ser + participio). Complex conditionals (si + imperfect + conditional). " +
      "Sophisticated use of aspect contrast (preterite/imperfect) for narrative effect.",
  },
  c1: {
    cefrLevel: "CEFR C1 (Advanced)",
    wordCount: "~8,000 words",
    sentenceGuidance:
      "Rich, flowing prose with varied rhythm and literary quality. " +
      "Long, complex sentences where appropriate. Sophisticated discourse structure. " +
      "Formal or literary register suitable to style.",
    vocabularyGuidance:
      "Full vocabulary range including literary expressions, " +
      "formal Latinate vocabulary, idioms, and proverbs (refranes). " +
      "Cultural and historical references. Nuanced register distinctions.",
    grammarGuidance:
      "Full grammar range: pluperfect subjunctive, conditional perfect, " +
      "complex relative clauses, nominalized infinitives. " +
      "Subtle aspectual distinctions and stylistic variety.",
  },
  c2: {
    cefrLevel: "CEFR C2 (Mastery)",
    wordCount: "~16,000+ words",
    sentenceGuidance:
      "Sophisticated literary, journalistic, or academic Spanish. " +
      "Native-speaker register with elegant stylistic variation. " +
      "Complex discourse architecture with cohesion and coherence at the highest level.",
    vocabularyGuidance:
      "Full vocabulary including archaic expressions, classical allusions, " +
      "regional variation, technical vocabulary, and highly nuanced semantic distinctions.",
    grammarGuidance:
      "All grammar including rare constructions, literary imperfect, archaic forms, " +
      "complex rhetorical devices (anaphora, chiasmus), and native-level stylistic mastery.",
  },
};

const lengthMap: Record<string, { sentences: string; words: string; maxTokens: number }> = {
  short:  { sentences: "8–12 sentences",  words: "120–200 Spanish words",    maxTokens: 3000 },
  medium: { sentences: "15–20 sentences", words: "250–400 Spanish words",    maxTokens: 6000 },
  long:   { sentences: "25–35 sentences", words: "450–700 Spanish words",    maxTokens: 10000 },
};

const styleMap: Record<string, string> = {
  story:      "a short narrative story with a clear beginning, middle, and end",
  article:    "an informative article or essay with a clear topic sentence",
  dialogue:   "a realistic conversation between two or more people, formatted naturally",
  reflection: "a personal reflection or journal entry written in first person",
  summary:    "a concise informational summary about the topic",
};

const topicImages: Record<string, string[]> = {
  default: [
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  ],
  "ciudad": [
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
  ],
  "comida": [
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
  ],
  "familia": [
    "https://images.unsplash.com/photo-1511895426328-dc8714191011?w=800&q=80",
  ],
  "viaje": [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  ],
  "travel": [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  ],
  "food": [
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
  ],
  "música": [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  ],
  "nature": [
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  ],
};

function getImagesForTopic(topic: string): string[] {
  const lower = topic.toLowerCase();
  for (const [key, urls] of Object.entries(topicImages)) {
    if (key !== "default" && lower.includes(key)) return urls;
  }
  return topicImages.default;
}

function getFallbackSpanishPassage(input: { difficulty: string; topic: string }): GeneratedSpanishPassage {
  return {
    title: "El café | At the Café",
    summary: "A simple story about visiting a café and ordering coffee.",
    spanishText: "Voy al café. Pido un café con leche. El café está rico. La camarera es amable. Quiero volver pronto.",
    sentences: [
      { spanish: "Voy al café.", english: "I go to the café." },
      { spanish: "Pido un café con leche.", english: "I order a coffee with milk." },
      { spanish: "El café está rico.", english: "The coffee is delicious." },
      { spanish: "La camarera es amable.", english: "The waitress is friendly." },
      { spanish: "Quiero volver pronto.", english: "I want to come back soon." },
    ],
    vocabulary: [
      { word: "pedir", english: "to order / to ask for", partOfSpeech: "verb", exampleSentence: "Pido un café." },
      { word: "café con leche", english: "coffee with milk", partOfSpeech: "noun phrase", exampleSentence: "Me gusta el café con leche." },
      { word: "rico/a", english: "delicious / rich", partOfSpeech: "adjective", exampleSentence: "La comida está rica." },
      { word: "amable", english: "kind / friendly", partOfSpeech: "adjective", exampleSentence: "El profesor es amable." },
      { word: "volver", english: "to return / come back", partOfSpeech: "verb", exampleSentence: "Quiero volver mañana." },
    ],
    comprehensionQuestions: [
      { question: "¿Adónde va el narrador?", answer: "Va al café." },
      { question: "¿Cómo está el café?", answer: "El café está rico." },
      { question: "¿Cómo es la camarera?", answer: "La camarera es amable." },
    ],
    imageUrls: topicImages.default,
  };
}

export async function generateSpanishPassage(input: {
  topic: string;
  difficulty: string;
  length: string;
  readingStyle: string;
  vocabularyFocus?: string;
  grammarFocus?: string;
}): Promise<GeneratedSpanishPassage> {
  const profile = cefrProfiles[input.difficulty] ?? cefrProfiles.b1;
  const lengthSpec = lengthMap[input.length] ?? lengthMap.medium;
  const styleDesc = styleMap[input.readingStyle] ?? styleMap.article;

  const vocabInstruction = input.vocabularyFocus
    ? `Naturally incorporate vocabulary related to: ${input.vocabularyFocus}.`
    : "";
  const grammarInstruction = input.grammarFocus
    ? `Feature and demonstrate these grammar patterns: ${input.grammarFocus}.`
    : "";

  const prompt = `You are a master Spanish language educator specializing in graded readers for heritage learners and adult students.

Create a ${profile.cefrLevel} (${profile.wordCount}) graded reading passage with these exact specifications:

TOPIC: ${input.topic}
STYLE: ${styleDesc}
LENGTH: ${lengthSpec.sentences} (approximately ${lengthSpec.words})
${vocabInstruction}
${grammarInstruction}

=== LANGUAGE CALIBRATION ===
SENTENCES: ${profile.sentenceGuidance}
VOCABULARY: ${profile.vocabularyGuidance}
GRAMMAR: ${profile.grammarGuidance}

=== HERITAGE LEARNER FOCUS ===
- Write formal, standard written Spanish with correct accent marks (á, é, í, ó, ú, ñ, ü, ¡, ¿)
- Ground the content in authentic Latin American or Spanish cultural contexts
- Avoid English loanwords unless widely used in the Spanish-speaking world
- Make the content genuinely interesting and culturally rich — not like a generic textbook

=== CONTENT QUALITY ===
- Each sentence should be pedagogically clear while remaining natural and engaging
- Use culturally authentic settings, names, and references
- The passage should feel like something a native speaker might actually write

Return ONLY a JSON object (no markdown, no code blocks) with EXACTLY this structure:
{
  "title": "Spanish title | English subtitle",
  "summary": "One or two sentence English summary of the passage",
  "sentences": [
    { "spanish": "Full Spanish sentence.", "english": "English translation." }
  ],
  "vocabulary": [
    {
      "word": "Spanish word or phrase",
      "english": "primary English meaning",
      "partOfSpeech": "noun | verb | adjective | adverb | preposition | conjunction | expression | phrase",
      "exampleSentence": "A simple example sentence in Spanish."
    }
  ],
  "comprehensionQuestions": [
    { "question": "Spanish question?", "answer": "Spanish answer from the passage." }
  ]
}

VOCABULARY: Include exactly 8–12 key words/phrases. Select words that are:
  - High-value for learners at this ${profile.cefrLevel} level
  - Actually used in the passage
  - A mix of nouns, verbs, adjectives, and useful expressions

COMPREHENSION QUESTIONS: Write exactly 3 questions in Spanish that test reading comprehension.`;

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
    sentences: SpanishSentence[];
    vocabulary: SpanishVocabItem[];
    comprehensionQuestions: Array<{ question: string; answer: string }>;
  };

  const spanishText = (parsed.sentences || []).map((s) => s.spanish).join(" ");

  return {
    title: parsed.title || `${input.topic} — Lectura`,
    summary: parsed.summary || "",
    spanishText,
    sentences: parsed.sentences || [],
    vocabulary: (parsed.vocabulary || []).slice(0, 12),
    comprehensionQuestions: (parsed.comprehensionQuestions || []).slice(0, 3),
    imageUrls: getImagesForTopic(input.topic),
  };
}

export async function glossSpanishWord(
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

  const prompt = `You are a Spanish language expert. Provide a concise gloss for the Spanish word or expression: "${word}"

${contextNote}

Return ONLY valid JSON (no markdown):
{
  "word": "${word}",
  "romanization": "",
  "englishMeaning": "primary English meaning in this context",
  "partOfSpeech": "noun | verb | adjective | adverb | preposition | conjunction | expression | phrase",
  "grammarNote": "brief grammar note if relevant (e.g. irregular preterite, reflexive verb, ser vs estar distinction). Omit if not needed.",
  "exampleSentence": "simple Spanish example sentence",
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

import { chatWithFallback, MODEL } from "./openai";
import { glossInstruction, supportLanguageName } from "./supportLanguage";

export interface EnglishSentence {
  english: string;
  translation: string;
}

export interface EnglishVocabItem {
  word: string;
  translation: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface GeneratedEnglishPassage {
  title: string;
  summary: string;
  englishText: string;
  sentences: EnglishSentence[];
  vocabulary: EnglishVocabItem[];
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
      "Present simple tense mostly. Subject-verb-object patterns. " +
      "Avoid subordinate clauses entirely.",
    vocabularyGuidance:
      "Strictly the ~500 most common English words. Concrete everyday nouns (house, family, food, work). " +
      "Basic verbs: be, have, go, eat, speak, live. Simple adjectives: big, small, good, bad. " +
      "No idioms, no slang, no complex vocabulary.",
    grammarGuidance:
      "Present simple only, plus 'to be'. Articles (a, an, the). " +
      "Basic negation with 'not' / 'don't'. " +
      "Basic question formation with What?, Where?, When?",
  },
  a2: {
    cefrLevel: "CEFR A2 (Elementary)",
    wordCount: "~1,000 most common words",
    sentenceGuidance:
      "Short sentences with occasional compound sentences joined by and, but, because. " +
      "Present and past simple tenses. Simple descriptions and narrations of past events.",
    vocabularyGuidance:
      "Common everyday vocabulary (1,000 word range). " +
      "Routine activities, shopping, travel, family, food. " +
      "Basic time expressions (yesterday, tomorrow, always). Avoid formal register.",
    grammarGuidance:
      "Present simple and past simple. Immediate future (going to). " +
      "Basic modal verbs (can, must). " +
      "Simple connectives: and, but, because, when.",
  },
  b1: {
    cefrLevel: "CEFR B1 (Intermediate)",
    wordCount: "~2,000 words",
    sentenceGuidance:
      "Medium-length sentences with clear connective structure. " +
      "Mix of tenses including present perfect and past continuous. " +
      "Natural discourse with topic development across sentences.",
    vocabularyGuidance:
      "Broader vocabulary including some abstract nouns and collocations. " +
      "Colloquial but not slangy expressions appropriate to context. " +
      "Topic-relevant vocabulary introduced naturally.",
    grammarGuidance:
      "Full range of simple, continuous, and perfect tenses. " +
      "Basic conditionals (first and second). " +
      "Discourse connectives: however, moreover, therefore, although.",
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
      "Passive voice, reported speech, third conditional. " +
      "Complex relative clauses and participle clauses. " +
      "Sophisticated use of modal verbs for speculation and deduction.",
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
      "formal vocabulary, idioms, and phrasal verbs. " +
      "Cultural and historical references. Nuanced register distinctions.",
    grammarGuidance:
      "Full grammar range: mixed conditionals, inversion for emphasis, " +
      "complex relative clauses, nominalization. " +
      "Subtle aspectual distinctions and stylistic variety.",
  },
  c2: {
    cefrLevel: "CEFR C2 (Mastery)",
    wordCount: "~16,000+ words",
    sentenceGuidance:
      "Sophisticated literary, journalistic, or academic English. " +
      "Native-speaker register with elegant stylistic variation. " +
      "Complex discourse architecture with cohesion and coherence at the highest level.",
    vocabularyGuidance:
      "Full vocabulary including archaic expressions, classical allusions, " +
      "regional variation, technical vocabulary, and highly nuanced semantic distinctions.",
    grammarGuidance:
      "All grammar including rare constructions, literary devices, archaic forms, " +
      "complex rhetorical devices (anaphora, chiasmus), and native-level stylistic mastery.",
  },
};

const lengthMap: Record<string, { sentences: string; words: string; maxTokens: number }> = {
  short:  { sentences: "8–12 sentences",  words: "120–200 English words",    maxTokens: 3000 },
  medium: { sentences: "15–20 sentences", words: "250–400 English words",    maxTokens: 6000 },
  long:   { sentences: "25–35 sentences", words: "450–700 English words",    maxTokens: 10000 },
};

const styleMap: Record<string, string> = {
  story:      "a short narrative story with a clear beginning, middle, and end",
  article:    "an informative article or essay with a clear topic sentence",
  dialogue:   "a realistic conversation between two or more people, formatted naturally",
  reflection: "a personal reflection or journal entry written in first person",
  summary:    "a concise informational summary about the topic",
};

function getFallbackEnglishPassage(input: { difficulty: string; topic: string }): GeneratedEnglishPassage {
  return {
    title: "At the Café",
    summary: "A simple story about visiting a café and ordering coffee.",
    englishText: "I go to the café. I order a coffee with milk. The coffee is delicious. The waitress is friendly. I want to come back soon.",
    sentences: [
      { english: "I go to the café.", translation: "I go to the café." },
      { english: "I order a coffee with milk.", translation: "I order a coffee with milk." },
      { english: "The coffee is delicious.", translation: "The coffee is delicious." },
      { english: "The waitress is friendly.", translation: "The waitress is friendly." },
      { english: "I want to come back soon.", translation: "I want to come back soon." },
    ],
    vocabulary: [
      { word: "order", translation: "to order / to ask for", partOfSpeech: "verb", exampleSentence: "I order a coffee." },
      { word: "coffee with milk", translation: "coffee with milk", partOfSpeech: "noun phrase", exampleSentence: "I like coffee with milk." },
      { word: "delicious", translation: "delicious / tasty", partOfSpeech: "adjective", exampleSentence: "The food is delicious." },
      { word: "friendly", translation: "kind / friendly", partOfSpeech: "adjective", exampleSentence: "The teacher is friendly." },
      { word: "come back", translation: "to return", partOfSpeech: "verb", exampleSentence: "I want to come back tomorrow." },
    ],
    comprehensionQuestions: [
      { question: "Where does the narrator go?", answer: "The narrator goes to the café." },
      { question: "How is the coffee?", answer: "The coffee is delicious." },
      { question: "How is the waitress?", answer: "The waitress is friendly." },
    ],
    imageUrls: [],
  };
}

export async function generateEnglishPassage(input: {
  topic: string;
  difficulty: string;
  length: string;
  readingStyle: string;
  vocabularyFocus?: string;
  grammarFocus?: string;
  supportLanguage?: string;
}): Promise<GeneratedEnglishPassage> {
  const profile = cefrProfiles[input.difficulty] ?? cefrProfiles.b1;
  const lengthSpec = lengthMap[input.length] ?? lengthMap.medium;
  const styleDesc = styleMap[input.readingStyle] ?? styleMap.article;
  const supportName = supportLanguageName(input.supportLanguage);

  const vocabInstruction = input.vocabularyFocus
    ? `Naturally incorporate vocabulary related to: ${input.vocabularyFocus}.`
    : "";
  const grammarInstruction = input.grammarFocus
    ? `Feature and demonstrate these grammar patterns: ${input.grammarFocus}.`
    : "";

  const prompt = `You are a master English language educator specializing in graded readers for adult English-as-a-second-language learners.

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

=== SUPPORT LANGUAGE ===
${glossInstruction(input.supportLanguage)}
Every sentence's "translation" field must be a ${supportName} translation of the English sentence (not English, unless the support language is English).

=== CONTENT QUALITY ===
- Make the content genuinely interesting and culturally authentic — NOT like a generic textbook
- Each sentence must be pedagogically clear while remaining natural and engaging
- For BEGINNER: aim for sentences a student could parse word-by-word
- For ADVANCED: aim for the richness of published English prose or journalism

Return ONLY a JSON object (no markdown, no code blocks) with EXACTLY this structure:
{
  "title": "English title | ${supportName} subtitle",
  "summary": "One or two sentence summary of what this passage is about, written in ${supportName}",
  "sentences": [
    { "english": "Full English sentence.", "translation": "${supportName} translation." }
  ],
  "vocabulary": [
    {
      "word": "English word or phrase",
      "translation": "primary meaning in ${supportName}",
      "partOfSpeech": "noun | verb | adjective | adverb | preposition | conjunction | expression | phrase",
      "exampleSentence": "A simple example sentence using this word (in English)."
    }
  ],
  "comprehensionQuestions": [
    { "question": "English question about the passage?", "answer": "English answer drawn from the passage." }
  ]
}

VOCABULARY: Include exactly 8–12 key words/phrases. Select words that are:
  - High-value for learners at this ${profile.cefrLevel} level
  - Actually used in the passage
  - A mix of nouns, verbs, adjectives, and useful expressions

COMPREHENSION QUESTIONS: Write exactly 3 questions in English that test reading comprehension.`;

  try {
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
      sentences: EnglishSentence[];
      vocabulary: EnglishVocabItem[];
      comprehensionQuestions: Array<{ question: string; answer: string }>;
    };

    const englishText = (parsed.sentences || []).map((s) => s.english).join(" ");

    return {
      title: parsed.title || `${input.topic} — Reading`,
      summary: parsed.summary || "",
      englishText,
      sentences: parsed.sentences || [],
      vocabulary: (parsed.vocabulary || []).slice(0, 12),
      comprehensionQuestions: (parsed.comprehensionQuestions || []).slice(0, 3),
      imageUrls: [],
    };
  } catch (err) {
    console.error("AI generation failed, using fallback:", err);
    return getFallbackEnglishPassage(input);
  }
}

export async function glossEnglishWord(
  word: string,
  context?: string,
  supportLanguage?: string,
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
  const supportName = supportLanguageName(supportLanguage);

  const prompt = `You are an English language expert. Provide a concise gloss for the English word or expression: "${word}"

${contextNote}

Write the meaning, grammar note, and example translation in ${supportName}.

Return ONLY valid JSON (no markdown):
{
  "word": "${word}",
  "romanization": "",
  "englishMeaning": "primary meaning in ${supportName}, in this context",
  "partOfSpeech": "noun | verb | adjective | adverb | preposition | conjunction | expression | phrase",
  "grammarNote": "brief grammar note if relevant. Omit if not needed.",
  "exampleSentence": "simple English example sentence",
  "exampleTranslation": "${supportName} translation of the example"
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

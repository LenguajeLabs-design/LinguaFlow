import { chatWithFallback, MODEL } from "./openai";
import { glossInstruction } from "./supportLanguage";

export interface ItalianSentence {
  italian: string;
  english: string;
}

export interface ItalianVocabItem {
  word: string;
  english: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface GeneratedItalianPassage {
  title: string;
  summary: string;
  italianText: string;
  sentences: ItalianSentence[];
  vocabulary: ItalianVocabItem[];
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
    cefrLevel: "CEFR A1 (Principiante)",
    wordCount: "~500 parole più comuni",
    sentenceGuidance:
      "Usa solo frasi brevi e semplici (5–10 parole ciascuna). " +
      "Solo presente indicativo (essere, avere, fare, andare). Strutture soggetto-verbo-oggetto. " +
      "Evita completamente le proposizioni subordinate. Usa il 'tu' informale.",
    vocabularyGuidance:
      "Strettamente le ~500 parole italiane più comuni. Sostantivi concreti di uso quotidiano " +
      "(casa, famiglia, cibo, lavoro). Verbi base: essere, avere, fare, andare, mangiare, parlare. " +
      "Aggettivi semplici: grande, piccolo, buono, brutto. Niente idiomi né vocabolario complesso.",
    grammarGuidance:
      "Solo presente indicativo. Articoli determinativi e indeterminativi. " +
      "Accordo aggettivo-sostantivo. Negazione con 'non'. " +
      "Domande semplici con Che cosa?, Dove?, Quando?",
  },
  a2: {
    cefrLevel: "CEFR A2 (Elementare)",
    wordCount: "~1.000 parole più comuni",
    sentenceGuidance:
      "Frasi brevi con qualche frase composta usando e, ma, perché. " +
      "Presente e passato prossimo. Descrizioni semplici e narrazioni di eventi recenti.",
    vocabularyGuidance:
      "Vocabolario quotidiano comune (range di 1.000 parole). " +
      "Attività di routine, acquisti, viaggi, famiglia, cibo. " +
      "Espressioni temporali di base (ieri, domani, sempre). Evita registri formali.",
    grammarGuidance:
      "Presente indicativo e passato prossimo. Futuro prossimo (stare + per + infinito). " +
      "Verbi riflessivi di base (alzarsi, chiamarsi). " +
      "Connettori semplici: e, ma, perché, quando, poi.",
  },
  b1: {
    cefrLevel: "CEFR B1 (Intermedio)",
    wordCount: "~2.000 parole",
    sentenceGuidance:
      "Frasi di media lunghezza con struttura connettiva chiara. " +
      "Misto di tempi tra imperfetto e passato prossimo. " +
      "Discorso naturale con sviluppo dell'argomento tra le frasi.",
    vocabularyGuidance:
      "Vocabolario più ampio con sostantivi astratti e collocazioni. " +
      "Espressioni colloquiali ma non gergali appropriate al contesto. " +
      "Vocabolario specifico dell'argomento introdotto naturalmente.",
    grammarGuidance:
      "Indicativo completo: presente, passato prossimo, imperfetto, futuro semplice, condizionale. " +
      "Congiuntivo di base in espressioni fisse (spero che, voglio che). " +
      "Connettori del discorso: tuttavia, inoltre, quindi, anche se.",
  },
  b2: {
    cefrLevel: "CEFR B2 (Intermedio Superiore)",
    wordCount: "~4.000 parole",
    sentenceGuidance:
      "Lunghezze di frase variate con struttura connettiva sofisticata. " +
      "Proposizioni subordinate complesse. Marcatori del discorso naturali. " +
      "Variazione di registro appropriata al contesto.",
    vocabularyGuidance:
      "Ampia gamma di vocabolario incluse espressioni formali e idiomatiche. " +
      "Linguaggio figurato usato naturalmente. Vocabolario accademico e culturale. " +
      "Scelte lessicali sfumate tra quasi-sinonimi.",
    grammarGuidance:
      "Congiuntivo completo in proposizioni nominali, aggettivali e avverbiali. " +
      "Passivo (essere + participio passato). Condizionali complessi. " +
      "Uso sofisticato del contrasto tra imperfetto e passato prossimo.",
  },
  c1: {
    cefrLevel: "CEFR C1 (Avanzato)",
    wordCount: "~8.000 parole",
    sentenceGuidance:
      "Prosa ricca e fluente con ritmo variato e qualità letteraria. " +
      "Frasi lunghe e complesse dove appropriato. Struttura del discorso sofisticata. " +
      "Registro formale o letterario adatto allo stile.",
    vocabularyGuidance:
      "Piena gamma di vocabolario incluse espressioni letterarie, " +
      "vocabolario formale, idiomi e proverbi italiani. " +
      "Riferimenti culturali e storici. Distinzioni di registro sfumate.",
    grammarGuidance:
      "Piena gamma grammaticale: congiuntivo trapassato, condizionale passato, " +
      "proposizioni relative complesse, infiniti nominalizzati. " +
      "Distinzioni aspettuali sottili e varietà stilistica.",
  },
  c2: {
    cefrLevel: "CEFR C2 (Padronanza)",
    wordCount: "~16.000+ parole",
    sentenceGuidance:
      "Italiano letterario, giornalistico o accademico sofisticato. " +
      "Registro del parlante nativo con elegante variazione stilistica. " +
      "Architettura del discorso complessa con coesione e coerenza al massimo livello.",
    vocabularyGuidance:
      "Vocabolario completo incluse espressioni arcaiche, allusioni classiche, " +
      "variazione regionale, vocabolario tecnico e distinzioni semantiche altamente sfumate.",
    grammarGuidance:
      "Tutta la grammatica incluse costruzioni rare, forme letterarie, " +
      "dispositivi retorici complessi e padronanza stilistica di livello nativo.",
  },
};

const lengthMap: Record<string, { sentences: string; words: string; maxTokens: number }> = {
  short:  { sentences: "8–12 frasi",   words: "120–200 parole italiane",  maxTokens: 3000 },
  medium: { sentences: "15–20 frasi",  words: "250–400 parole italiane",  maxTokens: 6000 },
  long:   { sentences: "25–35 frasi",  words: "450–700 parole italiane",  maxTokens: 10000 },
};

const styleMap: Record<string, string> = {
  story:      "a short narrative story with a clear beginning, middle, and end",
  article:    "an informative article or essay with a clear topic sentence",
  dialogue:   "a realistic conversation between two or more people, formatted naturally",
  reflection: "a personal reflection or journal entry written in first person",
  summary:    "a concise informational summary about the topic",
};

function getFallbackItalianPassage(input: { difficulty: string; topic: string }): GeneratedItalianPassage {
  return {
    title: "Il caffè | At the Café",
    summary: "A simple story about visiting a café and ordering coffee.",
    italianText: "Vado al bar. Ordino un caffè. Il caffè è buono. Il barista è gentile. Voglio tornare presto.",
    sentences: [
      { italian: "Vado al bar.", english: "I go to the café." },
      { italian: "Ordino un caffè.", english: "I order a coffee." },
      { italian: "Il caffè è buono.", english: "The coffee is good." },
      { italian: "Il barista è gentile.", english: "The barista is kind." },
      { italian: "Voglio tornare presto.", english: "I want to come back soon." },
    ],
    vocabulary: [
      { word: "ordinare", english: "to order", partOfSpeech: "verb", exampleSentence: "Ordino un caffè." },
      { word: "buono/a", english: "good / delicious", partOfSpeech: "adjective", exampleSentence: "Il cibo è buono." },
      { word: "gentile", english: "kind / friendly", partOfSpeech: "adjective", exampleSentence: "La professoressa è gentile." },
      { word: "tornare", english: "to return / come back", partOfSpeech: "verb", exampleSentence: "Voglio tornare domani." },
    ],
    comprehensionQuestions: [
      { question: "Dove va il narratore?", answer: "Va al bar." },
      { question: "Com'è il caffè?", answer: "Il caffè è buono." },
      { question: "Com'è il barista?", answer: "Il barista è gentile." },
    ],
    imageUrls: [],
  };
}

export async function generateItalianPassage(input: {
  topic: string;
  difficulty: string;
  length: string;
  readingStyle: string;
  vocabularyFocus?: string;
  grammarFocus?: string;
  supportLanguage?: string;
}): Promise<GeneratedItalianPassage> {
  const profile = cefrProfiles[input.difficulty] ?? cefrProfiles.b1;
  const lengthSpec = lengthMap[input.length] ?? lengthMap.medium;
  const styleDesc = styleMap[input.readingStyle] ?? styleMap.article;

  const vocabInstruction = input.vocabularyFocus
    ? `Naturally incorporate vocabulary related to: ${input.vocabularyFocus}.`
    : "";
  const grammarInstruction = input.grammarFocus
    ? `Feature and demonstrate these grammar patterns: ${input.grammarFocus}.`
    : "";

  const prompt = `You are a master Italian language educator specializing in graded readers for adult learners.

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

=== ITALIAN AUTHENTICITY ===
- Write formal, standard written Italian with correct accent marks (à, è, é, ì, ò, ù) and apostrophes
- Ground the content in authentic Italian cultural contexts (food, cities, art, family, history)
- Avoid English loanwords unless widely used in Italian
- Make the content genuinely interesting and culturally rich — not like a generic textbook

=== CONTENT QUALITY ===
- Each sentence should be pedagogically clear while remaining natural and engaging
- Use culturally authentic settings, names, and references (Italian cities, food, traditions)
- The passage should feel like something an educated Italian native speaker might actually write

Return ONLY a JSON object (no markdown, no code blocks) with EXACTLY this structure:
{
  "title": "Italian title | English subtitle",
  "summary": "One or two sentence English summary of the passage",
  "sentences": [
    { "italian": "Full Italian sentence.", "english": "English translation." }
  ],
  "vocabulary": [
    {
      "word": "Italian word or phrase",
      "english": "primary English meaning",
      "partOfSpeech": "noun | verb | adjective | adverb | preposition | conjunction | expression | phrase",
      "exampleSentence": "A simple example sentence in Italian."
    }
  ],
  "comprehensionQuestions": [
    { "question": "Italian question?", "answer": "Italian answer from the passage." }
  ]
}

VOCABULARY: Include exactly 8–12 key words/phrases. Select words that are:
  - High-value for learners at this ${profile.cefrLevel} level
  - Actually used in the passage
  - A mix of nouns, verbs, adjectives, and useful expressions

COMPREHENSION QUESTIONS: Write exactly 3 questions in Italian that test reading comprehension.`;

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
      sentences: ItalianSentence[];
      vocabulary: ItalianVocabItem[];
      comprehensionQuestions: Array<{ question: string; answer: string }>;
    };

    const italianText = (parsed.sentences || []).map((s) => s.italian).join(" ");

    return {
      title: parsed.title || `${input.topic} — Lettura`,
      summary: parsed.summary || "",
      italianText,
      sentences: parsed.sentences || [],
      vocabulary: (parsed.vocabulary || []).slice(0, 12),
      comprehensionQuestions: (parsed.comprehensionQuestions || []).slice(0, 3),
      imageUrls: [],
    };
  } catch {
    return getFallbackItalianPassage(input);
  }
}

export async function glossItalianWord(
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

  const prompt = `You are an Italian language expert. Provide a concise gloss for the Italian word or expression: "${word}"

${contextNote}

Return ONLY valid JSON (no markdown):
{
  "word": "${word}",
  "romanization": "",
  "englishMeaning": "primary English meaning in this context",
  "partOfSpeech": "noun | verb | adjective | adverb | preposition | conjunction | expression | phrase",
  "grammarNote": "brief grammar note if relevant (e.g. irregular past participle, reflexive verb, essere vs stare, subjunctive trigger). Omit if not needed.",
  "exampleSentence": "simple Italian example sentence",
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

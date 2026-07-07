import { chatWithFallback, MODEL } from "./openai";

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

export interface ComprehensionQuestion {
  question: string;
  answer: string;
}

export interface GeneratedPassage {
  title: string;
  summary: string;
  koreanText: string;
  sentences: Sentence[];
  vocabulary: VocabularyItem[];
  comprehensionQuestions: ComprehensionQuestion[];
  imageUrls: string[];
}

// ─── Difficulty calibration ──────────────────────────────────────────
const difficultyProfiles: Record<string, {
  topikLevel: string;
  sentenceGuidance: string;
  vocabularyGuidance: string;
  grammarGuidance: string;
}> = {
  beginner: {
    topikLevel: "TOPIK I Level 1",
    sentenceGuidance:
      "Use only very short, simple sentences (5–10 syllables each). " +
      "Subject-verb or subject-object-verb patterns only. No subordinate clauses. " +
      "Present tense primarily. Use 은/는, 이/가, 을/를 particles only.",
    vocabularyGuidance:
      "Only the 800 most common Korean words. Concrete nouns, basic verbs (가다, 오다, 먹다, 마시다, 있다, 없다). " +
      "No idiomatic expressions. No abbreviations or slang.",
    grammarGuidance:
      "Endings: -아요/어요 (polite present), -았어요/었어요 (past), -(으)세요 (request). " +
      "No complex connectives. No noun-modifying clauses.",
  },
  lower_intermediate: {
    topikLevel: "TOPIK I Level 2",
    sentenceGuidance:
      "Short to medium sentences. Occasional compound sentences with -고 (and), -지만 (but). " +
      "Consistent use of past, present, future tenses. Basic cause/effect with -아서/어서.",
    vocabularyGuidance:
      "Common everyday vocabulary (2,000–3,000 word range). " +
      "Basic adjectives, simple adverbs. Avoid formal Sino-Korean compound words.",
    grammarGuidance:
      "Endings: polite formal/informal speech (-어요/-습니다). " +
      "Connectives: -고, -지만, -아서/어서, -(으)면. Basic noun modification.",
  },
  intermediate: {
    topikLevel: "TOPIK II Level 3",
    sentenceGuidance:
      "Medium-length sentences with clear connective structure. Mix of simple and complex clauses. " +
      "Natural rhythm with varied sentence lengths. Cause-effect, condition, contrast patterns.",
    vocabularyGuidance:
      "Broader vocabulary including some Sino-Korean compounds. " +
      "Colloquial expressions appropriate to the style. Some abstract nouns.",
    grammarGuidance:
      "Full range of connective endings: -(으)면서, -는데, -(으)ㄹ 때, -기 위해, -도록. " +
      "Noun modification with -(으)ㄴ/는. Quotative patterns.",
  },
  upper_intermediate: {
    topikLevel: "TOPIK II Level 4",
    sentenceGuidance:
      "Varied sentence lengths including some longer, flowing sentences. " +
      "Natural discourse markers (그런데, 그래서, 그러나, 따라서). " +
      "Register variation appropriate to context (formal/informal).",
    vocabularyGuidance:
      "Wider vocabulary range including idiomatic expressions, " +
      "4-character Sino-Korean idioms (사자성어), and topic-specific terms.",
    grammarGuidance:
      "Complex endings: -(으)ㄹ수록, -다 보니, -(으)ㄹ 뿐만 아니라, -는 반면에. " +
      "Indirect speech, passive constructions, causative forms.",
  },
  advanced: {
    topikLevel: "TOPIK II Level 5–6",
    sentenceGuidance:
      "Rich, flowing prose with varied rhythm. Long sentences where appropriate for effect. " +
      "Sophisticated discourse structure with topic sentences and development. " +
      "Literary or academic register depending on style.",
    vocabularyGuidance:
      "Full vocabulary range including literary expressions, " +
      "formal Sino-Korean vocabulary, proverbs, and nuanced word choices. " +
      "Cultural and historical references appropriate.",
    grammarGuidance:
      "Full grammar range: complex nominalization (-기, -음), advanced clause connectors, " +
      "literary endings (-더라, -(으)련만, -건만), subtle register distinctions.",
  },
};

const lengthMap: Record<string, { sentences: string; chars: string }> = {
  short:  { sentences: "8–12 sentences",   chars: "160–240 Korean characters"   },
  medium: { sentences: "15–20 sentences",  chars: "320–460 Korean characters"   },
  long:   { sentences: "50–70 sentences",  chars: "1,200–1,800 Korean characters" },
};

const styleMap: Record<string, string> = {
  story:      "a short narrative story with a clear beginning, middle, and end",
  article:    "an informative article or essay with a clear topic sentence",
  dialogue:   "a realistic conversation between two or more people, formatted naturally",
  reflection: "a personal reflection or journal entry written in first person",
};


// ─── Fallback sample content ─────────────────────────────────────────
function getFallbackPassage(input: PassageInput): GeneratedPassage {
  const samples: Record<string, GeneratedPassage> = {
    beginner: {
      title: "카페 | At the Café",
      summary: "A simple story about ordering coffee at a Korean café for the first time.",
      koreanText: "저는 카페에 가요. 커피를 마셔요. 커피는 맛있어요. 직원이 친절해요. 또 오고 싶어요.",
      sentences: [
        { korean: "저는 카페에 가요.", english: "I go to the café." },
        { korean: "커피를 마셔요.", english: "I drink coffee." },
        { korean: "커피는 맛있어요.", english: "The coffee is delicious." },
        { korean: "직원이 친절해요.", english: "The staff member is kind." },
        { korean: "또 오고 싶어요.", english: "I want to come again." },
      ],
      vocabulary: [
        { korean: "카페", romanization: "kape", english: "café", partOfSpeech: "noun", exampleSentence: "카페에 가요." },
        { korean: "커피", romanization: "keopi", english: "coffee", partOfSpeech: "noun", exampleSentence: "커피를 마셔요." },
        { korean: "마시다", romanization: "masida", english: "to drink", partOfSpeech: "verb", exampleSentence: "물을 마셔요." },
        { korean: "맛있다", romanization: "masitda", english: "to be delicious", partOfSpeech: "adjective", exampleSentence: "음식이 맛있어요." },
        { korean: "직원", romanization: "jigwon", english: "staff member / employee", partOfSpeech: "noun", exampleSentence: "직원이 와요." },
        { korean: "친절하다", romanization: "chinjeolhada", english: "to be kind / friendly", partOfSpeech: "adjective", exampleSentence: "선생님이 친절해요." },
        { korean: "또", romanization: "tto", english: "again / also", partOfSpeech: "adverb", exampleSentence: "또 먹고 싶어요." },
        { korean: "싶다", romanization: "sipda", english: "to want to (with -고)", partOfSpeech: "auxiliary verb", exampleSentence: "가고 싶어요." },
      ],
      comprehensionQuestions: [
        { question: "어디에 가요?", answer: "카페에 가요." },
        { question: "직원이 어때요?", answer: "직원이 친절해요." },
        { question: "또 오고 싶어요?", answer: "네, 또 오고 싶어요." },
      ],
      imageUrls: [],
    },
    lower_intermediate: {
      title: "지하철 | Taking the Subway",
      summary: "A short account of using Seoul's subway system — buying a card, finding the right line, and arriving at the destination.",
      koreanText: "저는 오늘 지하철을 탔어요. 먼저 교통 카드를 샀어요. 2호선을 타고 강남역에 갔어요. 지하철 안에서 음악을 들었어요. 역에서 내린 후 친구를 만났어요. 같이 점심을 먹었어요. 지하철은 빠르고 편리해요.",
      sentences: [
        { korean: "저는 오늘 지하철을 탔어요.", english: "I took the subway today." },
        { korean: "먼저 교통 카드를 샀어요.", english: "First I bought a transit card." },
        { korean: "2호선을 타고 강남역에 갔어요.", english: "I took Line 2 and went to Gangnam Station." },
        { korean: "지하철 안에서 음악을 들었어요.", english: "I listened to music on the subway." },
        { korean: "역에서 내린 후 친구를 만났어요.", english: "After getting off at the station, I met my friend." },
        { korean: "같이 점심을 먹었어요.", english: "We ate lunch together." },
        { korean: "지하철은 빠르고 편리해요.", english: "The subway is fast and convenient." },
      ],
      vocabulary: [
        { korean: "지하철", romanization: "jihacheol", english: "subway / metro", partOfSpeech: "noun", exampleSentence: "지하철을 타요." },
        { korean: "교통 카드", romanization: "gyotong kadeu", english: "transit card", partOfSpeech: "noun", exampleSentence: "교통 카드가 있어요." },
        { korean: "호선", romanization: "hoseon", english: "subway line (counter)", partOfSpeech: "noun", exampleSentence: "1호선을 타요." },
        { korean: "역", romanization: "yeok", english: "station", partOfSpeech: "noun", exampleSentence: "다음 역에서 내려요." },
        { korean: "내리다", romanization: "naerida", english: "to get off (a vehicle)", partOfSpeech: "verb", exampleSentence: "여기에서 내려요." },
        { korean: "편리하다", romanization: "pyeollihada", english: "to be convenient", partOfSpeech: "adjective", exampleSentence: "지하철이 편리해요." },
        { korean: "-(으)ㄴ 후", romanization: "-(eu)n hu", english: "after doing (sequence)", partOfSpeech: "connective ending", exampleSentence: "밥을 먹은 후 산책해요." },
        { korean: "같이", romanization: "gachi", english: "together / with someone", partOfSpeech: "adverb", exampleSentence: "친구와 같이 가요." },
      ],
      comprehensionQuestions: [
        { question: "어디에 가려고 지하철을 탔어요?", answer: "강남역에 가려고 지하철을 탔어요." },
        { question: "지하철 안에서 무엇을 했어요?", answer: "음악을 들었어요." },
        { question: "역에서 내린 후 무엇을 했어요?", answer: "친구를 만나서 같이 점심을 먹었어요." },
      ],
      imageUrls: [],
    },
    intermediate: {
      title: "한강 공원 | Han River Park",
      summary: "A weekend afternoon at Han River Park — a popular gathering spot in Seoul where people relax, eat, and enjoy the outdoors.",
      koreanText: "주말에 한강 공원에 갔어요. 날씨가 맑아서 사람이 많았어요. 치킨을 먹으면서 강을 바라봤어요. 아이들이 자전거를 타고 있었고, 어른들은 돗자리를 깔고 쉬고 있었어요. 서울의 바쁜 일상에서 잠깐 벗어난 것 같아 기분이 좋았어요.",
      sentences: [
        { korean: "주말에 한강 공원에 갔어요.", english: "I went to Han River Park on the weekend." },
        { korean: "날씨가 맑아서 사람이 많았어요.", english: "The weather was clear, so there were many people." },
        { korean: "치킨을 먹으면서 강을 바라봤어요.", english: "I watched the river while eating fried chicken." },
        { korean: "아이들이 자전거를 타고 있었고, 어른들은 돗자리를 깔고 쉬고 있었어요.", english: "Children were riding bikes, and adults were spreading out mats and resting." },
        { korean: "서울의 바쁜 일상에서 잠깐 벗어난 것 같아 기분이 좋았어요.", english: "It felt nice, as though I had briefly escaped Seoul's busy daily life." },
      ],
      vocabulary: [
        { korean: "한강", romanization: "Hangang", english: "Han River", partOfSpeech: "noun", exampleSentence: "한강 공원에 가요." },
        { korean: "맑다", romanization: "makda", english: "to be clear / sunny", partOfSpeech: "adjective", exampleSentence: "날씨가 맑아요." },
        { korean: "바라보다", romanization: "baraboda", english: "to gaze at / look out at", partOfSpeech: "verb", exampleSentence: "창문 밖을 바라봐요." },
        { korean: "돗자리", romanization: "dotjari", english: "picnic mat / ground mat", partOfSpeech: "noun", exampleSentence: "돗자리를 깔고 앉아요." },
        { korean: "깔다", romanization: "kkaldo", english: "to spread out / lay down", partOfSpeech: "verb", exampleSentence: "담요를 깔아요." },
        { korean: "일상", romanization: "ilsang", english: "daily life / routine", partOfSpeech: "noun", exampleSentence: "바쁜 일상이에요." },
        { korean: "벗어나다", romanization: "beoseunada", english: "to escape from / break free of", partOfSpeech: "verb", exampleSentence: "일상에서 벗어나요." },
        { korean: "-(으)면서", romanization: "-(eu)myeonseo", english: "while doing (simultaneous actions)", partOfSpeech: "connective ending", exampleSentence: "음악을 들으면서 공부해요." },
      ],
      comprehensionQuestions: [
        { question: "언제 한강 공원에 갔어요?", answer: "주말에 갔어요." },
        { question: "사람이 왜 많았어요?", answer: "날씨가 맑아서 사람이 많았어요." },
        { question: "아이들이 한강 공원에서 무엇을 했어요?", answer: "자전거를 탔어요." },
      ],
      imageUrls: [],
    },
    upper_intermediate: {
      title: "계절의 변화 | Changing Seasons",
      summary: "A personal reflection on how each of Korea's four distinct seasons brings different moods, foods, and memories — and what that cycle means to the writer.",
      koreanText: "한국의 사계절은 각기 다른 색깔을 가지고 있다. 봄에는 벚꽃이 피어 거리가 분홍빛으로 물들고, 사람들은 오랜만에 따뜻한 햇살을 즐긴다. 여름은 뜨겁고 습하지만 그만큼 활기차고, 바다와 계곡으로 떠나는 여행이 많아진다. 가을이 되면 단풍이 산을 붉게 물들이고, 선선한 바람과 함께 독서와 사색의 계절이 찾아온다. 그리고 겨울, 눈이 내리는 날이면 도시의 소음도 잦아들고 세상이 잠시 조용해지는 것 같다. 계절이 바뀔 때마다 나는 지난 시간을 돌아보며 새로운 다짐을 한다.",
      sentences: [
        { korean: "한국의 사계절은 각기 다른 색깔을 가지고 있다.", english: "Korea's four seasons each have a different character." },
        { korean: "봄에는 벚꽃이 피어 거리가 분홍빛으로 물들고, 사람들은 오랜만에 따뜻한 햇살을 즐긴다.", english: "In spring, cherry blossoms bloom and streets turn pink, and people enjoy warm sunshine for the first time in a long while." },
        { korean: "여름은 뜨겁고 습하지만 그만큼 활기차고, 바다와 계곡으로 떠나는 여행이 많아진다.", english: "Summer is hot and humid, but equally lively, and trips to the ocean and valleys increase." },
        { korean: "가을이 되면 단풍이 산을 붉게 물들이고, 선선한 바람과 함께 독서와 사색의 계절이 찾아온다.", english: "When autumn arrives, autumn leaves turn the mountains red, and a season of reading and reflection comes with the cool breeze." },
        { korean: "그리고 겨울, 눈이 내리는 날이면 도시의 소음도 잦아들고 세상이 잠시 조용해지는 것 같다.", english: "And in winter, on snowy days, even the city's noise fades and the world seems to go quiet for a moment." },
        { korean: "계절이 바뀔 때마다 나는 지난 시간을 돌아보며 새로운 다짐을 한다.", english: "Each time the season changes, I look back on the time that has passed and make new resolutions." },
      ],
      vocabulary: [
        { korean: "사계절", romanization: "sagyejeol", english: "the four seasons", partOfSpeech: "noun", exampleSentence: "한국에는 사계절이 있어요." },
        { korean: "각기", romanization: "gaggi", english: "each / respectively", partOfSpeech: "adverb", exampleSentence: "각기 다른 개성이 있다." },
        { korean: "물들다", romanization: "muldeulda", english: "to be dyed / take on a color", partOfSpeech: "verb", exampleSentence: "하늘이 붉게 물들었다." },
        { korean: "단풍", romanization: "danpung", english: "autumn foliage / fall colors", partOfSpeech: "noun", exampleSentence: "단풍 구경을 갔어요." },
        { korean: "선선하다", romanization: "seonseonhada", english: "to be pleasantly cool (weather)", partOfSpeech: "adjective", exampleSentence: "가을 바람이 선선해요." },
        { korean: "사색", romanization: "sasaek", english: "contemplation / deep thought", partOfSpeech: "noun", exampleSentence: "조용히 사색에 잠겼다." },
        { korean: "잦아들다", romanization: "jachadeuolda", english: "to subside / die down", partOfSpeech: "verb", exampleSentence: "비바람이 잦아들었다." },
        { korean: "다짐", romanization: "dajim", english: "resolution / firm decision", partOfSpeech: "noun", exampleSentence: "새해 다짐을 세웠다." },
        { korean: "돌아보다", romanization: "doraboda", english: "to look back / reflect on", partOfSpeech: "verb", exampleSentence: "지난 일을 돌아봤다." },
      ],
      comprehensionQuestions: [
        { question: "봄에 한국 거리는 어떤 모습입니까?", answer: "벚꽃이 피어 거리가 분홍빛으로 물듭니다." },
        { question: "글쓴이에게 가을은 어떤 계절입니까?", answer: "독서와 사색의 계절입니다." },
        { question: "계절이 바뀔 때마다 글쓴이는 무엇을 합니까?", answer: "지난 시간을 돌아보며 새로운 다짐을 합니다." },
      ],
      imageUrls: [],
    },
    advanced: {
      title: "도시의 고독 | Urban Solitude",
      summary: "A literary reflection on the paradox of loneliness in a dense, hyper-connected city — finding stillness amid Seoul's relentless energy.",
      koreanText: "수백만 명이 오가는 도시 한복판에서 나는 종종 묘한 고독감을 느낀다. 붐비는 지하철 안에서도, 형형색색의 간판이 즐비한 거리를 걸을 때도, 그 고독은 어김없이 나를 찾아온다. 현대 도시의 삶이란 끊임없는 연결 속에서 역설적으로 단절을 경험하는 것일지도 모른다. 그럼에도 불구하고 나는 이 도시를 사랑한다. 소음 속에서 발견하는 침묵, 군중 속에서 만나는 나 자신—그것이야말로 서울이 내게 주는 가장 이상한, 그리고 가장 소중한 선물이다.",
      sentences: [
        { korean: "수백만 명이 오가는 도시 한복판에서 나는 종종 묘한 고독감을 느낀다.", english: "In the middle of a city where millions of people come and go, I often feel a strange sense of loneliness." },
        { korean: "붐비는 지하철 안에서도, 형형색색의 간판이 즐비한 거리를 걸을 때도, 그 고독은 어김없이 나를 찾아온다.", english: "Even inside a crowded subway, even when walking streets lined with colorful signs, that loneliness unfailingly finds me." },
        { korean: "현대 도시의 삶이란 끊임없는 연결 속에서 역설적으로 단절을 경험하는 것일지도 모른다.", english: "Perhaps life in a modern city is, paradoxically, to experience disconnection within constant connection." },
        { korean: "그럼에도 불구하고 나는 이 도시를 사랑한다.", english: "And yet, despite all of that, I love this city." },
        { korean: "소음 속에서 발견하는 침묵, 군중 속에서 만나는 나 자신—그것이야말로 서울이 내게 주는 가장 이상한, 그리고 가장 소중한 선물이다.", english: "The silence found within noise, the self encountered within a crowd—that is the strangest, and most precious, gift Seoul gives me." },
      ],
      vocabulary: [
        { korean: "고독감", romanization: "godokgam", english: "sense of loneliness / solitude", partOfSpeech: "noun", exampleSentence: "이상한 고독감을 느꼈다." },
        { korean: "형형색색", romanization: "hyeonghyeongsaeksaek", english: "various colors / multicolored", partOfSpeech: "idiom (4-char)", exampleSentence: "형형색색의 꽃들이 피었다." },
        { korean: "즐비하다", romanization: "jeulbihada", english: "to be lined up / densely packed", partOfSpeech: "adjective", exampleSentence: "음식점이 즐비한 거리." },
        { korean: "어김없이", romanization: "eogimeopsi", english: "without fail / unfailingly", partOfSpeech: "adverb", exampleSentence: "그는 어김없이 나타났다." },
        { korean: "역설적으로", romanization: "yeokseoljeogeuro", english: "paradoxically", partOfSpeech: "adverb", exampleSentence: "역설적으로 더 외로웠다." },
        { korean: "단절", romanization: "danjeol", english: "disconnection / severance", partOfSpeech: "noun", exampleSentence: "사회적 단절이 심각하다." },
        { korean: "침묵", romanization: "chimmuk", english: "silence", partOfSpeech: "noun", exampleSentence: "침묵이 흘렀다." },
        { korean: "소중하다", romanization: "sojunghada", english: "to be precious / cherished", partOfSpeech: "adjective", exampleSentence: "소중한 사람들을 지킨다." },
      ],
      comprehensionQuestions: [
        { question: "글쓴이는 도시에서 어떤 감정을 자주 느낍니까?", answer: "수백만 명이 오가는 도시 한복판에서 묘한 고독감을 느낍니다." },
        { question: "현대 도시의 삶을 어떻게 설명합니까?", answer: "끊임없는 연결 속에서 역설적으로 단절을 경험하는 것이라고 설명합니다." },
        { question: "글쓴이에게 서울이 주는 선물은 무엇입니까?", answer: "소음 속에서 발견하는 침묵과 군중 속에서 만나는 자기 자신입니다." },
      ],
      imageUrls: [],
    },
  };

  const level = input.difficulty in samples ? input.difficulty : "intermediate";
  const sample = samples[level];
  return {
    ...sample,
    title: `${sample.title} (Sample — AI unavailable)`,
  };
}

// ─── Main generator ──────────────────────────────────────────────────
export async function generateKoreanPassage(input: PassageInput): Promise<GeneratedPassage> {
  const profile = difficultyProfiles[input.difficulty] ?? difficultyProfiles.intermediate;
  const lengthSpec = lengthMap[input.length] ?? lengthMap.medium;
  const styleDesc = styleMap[input.readingStyle] ?? styleMap.article;

  const vocabInstruction = input.vocabularyFocus
    ? `Naturally incorporate vocabulary related to: ${input.vocabularyFocus}.`
    : "";
  const grammarInstruction = input.grammarFocus
    ? `Feature and demonstrate these grammar patterns: ${input.grammarFocus}.`
    : "";

  const prompt = `You are a master Korean language educator and author specializing in graded readers for adult learners.

Create a ${profile.topikLevel} graded reading passage with these exact specifications:

TOPIC: ${input.topic}
STYLE: ${styleDesc}
LENGTH: ${lengthSpec.sentences} (approximately ${lengthSpec.chars})
${vocabInstruction}
${grammarInstruction}

=== LANGUAGE CALIBRATION ===
SENTENCES: ${profile.sentenceGuidance}
VOCABULARY: ${profile.vocabularyGuidance}
GRAMMAR: ${profile.grammarGuidance}

=== CONTENT QUALITY ===
- Make the content genuinely interesting and culturally authentic — NOT like a generic textbook
- Ground the passage in real Korean culture, places, and experiences
- Each sentence must be pedagogically clear while remaining natural and engaging
- For BEGINNER: aim for sentences a student could parse word-by-word
- For ADVANCED: aim for the richness of published Korean prose or journalism

Return ONLY a JSON object (no markdown, no code blocks) with EXACTLY this structure:
{
  "title": "Korean title (2–8 chars) | English subtitle",
  "summary": "One or two sentence English summary of what this passage is about",
  "sentences": [
    { "korean": "Korean sentence.", "english": "Accurate English translation." }
  ],
  "vocabulary": [
    {
      "korean": "word or expression",
      "romanization": "Revised Romanization",
      "english": "primary meaning in context",
      "partOfSpeech": "noun | verb | adjective | adverb | particle | connective ending | expression",
      "exampleSentence": "A simple example sentence using this word (in Korean)."
    }
  ],
  "comprehensionQuestions": [
    { "question": "Korean question about the passage?", "answer": "Korean answer drawn from the passage." }
  ]
}

VOCABULARY: Include exactly 8–12 key items. Select words that are:
  - High-value for learners at this level (not too easy, not obscure)
  - Actually used in the passage
  - A mix of parts of speech (not all nouns)

COMPREHENSION QUESTIONS: Write exactly 3 questions in Korean that test understanding. Answers should be short and directly supported by the text.`;

  try {
    const response = await chatWithFallback({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(clean) as {
      title: string;
      summary: string;
      sentences: Sentence[];
      vocabulary: VocabularyItem[];
      comprehensionQuestions: ComprehensionQuestion[];
    };

    const koreanText = parsed.sentences.map((s) => s.korean).join(" ");

    return {
      title: parsed.title || `${input.topic} 읽기`,
      summary: parsed.summary || "",
      koreanText,
      sentences: parsed.sentences,
      vocabulary: (parsed.vocabulary || []).slice(0, 12),
      comprehensionQuestions: (parsed.comprehensionQuestions || []).slice(0, 3),
      imageUrls: [],
    };
  } catch (err) {
    console.error("AI generation failed, using fallback:", err);
    return getFallbackPassage(input);
  }
}

// ─── Word gloss ──────────────────────────────────────────────────────
export async function glossKoreanWord(
  word: string,
  context?: string,
  difficulty?: string,
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
  const levelNote = difficulty ? `Learner level: ${difficulty}` : "";

  const prompt = `You are a Korean language expert. Provide a concise gloss for the Korean word or expression: "${word}"

${contextNote}
${levelNote}

Return ONLY valid JSON (no markdown):
{
  "word": "${word}",
  "romanization": "romanization using Revised Romanization of Korean",
  "englishMeaning": "primary English meaning in this context",
  "partOfSpeech": "noun | verb | adjective | adverb | particle | connective ending | expression | suffix",
  "grammarNote": "brief grammar explanation if relevant (e.g. -아서/어서 = because/so). Omit if not needed.",
  "exampleSentence": "simple Korean example sentence",
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

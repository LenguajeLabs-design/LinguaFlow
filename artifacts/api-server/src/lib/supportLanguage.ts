export const SUPPORT_LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ko: "Korean",
  zh: "Chinese",
  es: "Spanish",
};

export function supportLanguageName(code?: string): string {
  return SUPPORT_LANGUAGE_NAMES[code ?? "en"] ?? "English";
}

export function glossInstruction(supportLanguage?: string): string {
  const name = supportLanguageName(supportLanguage);
  if (name === "English") {
    return "Write all vocabulary meanings, the summary, translations, and any grammar notes in English.";
  }
  return `Write all vocabulary meanings, the summary, translations, and any grammar notes in ${name} (not English), since the learner's support language is ${name}. Keep example sentences in the target language being learned.`;
}

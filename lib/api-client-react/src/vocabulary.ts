import { customFetch } from "./custom-fetch";
import type { SavedVocab, SaveVocabRequest, UpdateVocabRequest } from "./generated/api.schemas";

export const vocabularyApi = {
  list: (language?: string) => {
    const qs = language ? `?language=${language}` : "";
    return customFetch<SavedVocab[]>(`/api/vocabulary${qs}`);
  },

  save: (data: SaveVocabRequest) =>
    customFetch<SavedVocab>("/api/vocabulary", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateVocabRequest) =>
    customFetch<SavedVocab>(`/api/vocabulary/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    customFetch<{ success: boolean }>(`/api/vocabulary/${id}`, { method: "DELETE" }),

  exportCsv: (language?: string) => {
    const qs = language ? `?language=${language}` : "";
    return fetch(`/api/vocabulary/export.csv${qs}`, { credentials: "include" });
  },
};

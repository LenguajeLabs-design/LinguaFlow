import { customFetch } from "./custom-fetch";

export interface AuthUser {
  id: number;
  email: string;
}

export const authApi = {
  signup: (email: string, password: string) =>
    customFetch<AuthUser>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    customFetch<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    customFetch<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

  me: () =>
    customFetch<AuthUser>("/api/auth/me"),
};

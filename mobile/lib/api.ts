const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export const api = {
  baseUrl: BACKEND_URL,

  async get<T>(path: string): Promise<T | null> {
    const res = await fetch(`${BACKEND_URL}${path}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return data as T;
  },

  async post<T>(path: string, body: object): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { message?: string }).message ?? "Erro na requisição";
      throw new Error(msg);
    }
    return data as T;
  },
};

export type LoginResponse = { token: string; user: { id: string; name: string; email: string } };
export type RegisterResponse = { id: string; name: string; email: string };

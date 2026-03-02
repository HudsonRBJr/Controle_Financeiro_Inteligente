const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

async function getHeaders(auth = false): Promise<HeadersInit> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (auth) {
    const { auth: authLib } = await import("./auth");
    const token = await authLib.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  baseUrl: BACKEND_URL,

  async get<T>(path: string, options?: { auth?: boolean }): Promise<T | null> {
    const headers = await getHeaders(options?.auth);
    const res = await fetch(`${BACKEND_URL}${path}`, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return data as T;
  },

  async getAuth<T>(path: string): Promise<T> {
    const headers = await getHeaders(true);
    const res = await fetch(`${BACKEND_URL}${path}`, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { message?: string }).message ?? "Erro na requisição";
      throw new Error(msg);
    }
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

  async postAuth<T>(path: string, body: object): Promise<T> {
    const headers = await getHeaders(true);
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { message?: string }).message ?? "Erro na requisição";
      throw new Error(msg);
    }
    return data as T;
  },

  async putAuth<T>(path: string, body: object): Promise<T> {
    const headers = await getHeaders(true);
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { message?: string }).message ?? "Erro na requisição";
      throw new Error(msg);
    }
    return data as T;
  },

  async deleteAuth(path: string): Promise<void> {
    const headers = await getHeaders(true);
    const res = await fetch(`${BACKEND_URL}${path}`, { method: "DELETE", headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = (data as { message?: string }).message ?? "Erro na requisição";
      throw new Error(msg);
    }
  },
};

export type LoginResponse = { token: string; user: { id: string; name: string; email: string } };
export type RegisterResponse = { id: string; name: string; email: string };

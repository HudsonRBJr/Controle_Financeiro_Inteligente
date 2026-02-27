import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, type LoginResponse } from "./api";

const TOKEN_KEY = "@auth_token";

export const auth = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return api.post<LoginResponse>("/auth/login", { email, password });
  },

  async register(name: string, email: string, password: string) {
    return api.post("/users", { name, email, password });
  },

  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};

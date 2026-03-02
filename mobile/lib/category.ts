import { api } from "./api";

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  createdAt: string;
  userId: string;
};

export async function getCategories(): Promise<Category[]> {
  return api.getAuth<Category[]>("/categories");
}

export async function createCategory(data: { name: string; color?: string }) {
  return api.postAuth<Category>("/categories", data);
}

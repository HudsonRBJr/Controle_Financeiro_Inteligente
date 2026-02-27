import { api } from "./api";

export type Configuration = {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
};

export async function getConfiguration(): Promise<Configuration | null> {
  return api.get<Configuration>("/configurations");
}

import type { Express } from "express";

let cachedApp: Express | null = null;

export async function getTestApp(): Promise<Express> {
  if (cachedApp) return cachedApp;

  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/controle_financeiro_test";

  const mod = await import("../../app");
  cachedApp = mod.app;
  return cachedApp;
}

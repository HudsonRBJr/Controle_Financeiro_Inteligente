import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("App bootstrap and public routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("returns OK on GET /health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "OK" });
  });

  it("returns Hello World on GET /hello", async () => {
    const response = await request(app).get("/hello");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello World" });
  });

  it("serves HTML documentation on GET /documentacao", async () => {
    const response = await request(app).get("/documentacao");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("<!DOCTYPE html>");
    expect(response.text).toContain("Documentação da API");
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/rota-que-nao-existe");

    expect(response.status).toBe(404);
  });
});

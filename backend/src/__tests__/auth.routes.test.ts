import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Auth routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("returns 400 when email is missing on POST /auth/login", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ password: "123456" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "E-mail e senha são obrigatórios.",
    });
  });

  it("returns 400 when password is missing on POST /auth/login", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "teste@exemplo.com" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "E-mail e senha são obrigatórios.",
    });
  });

  it("returns 400 when body is empty on POST /auth/login", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "E-mail e senha são obrigatórios.",
    });
  });
});

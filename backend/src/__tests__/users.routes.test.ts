import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Users routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("keeps POST /users public (does not require token)", async () => {
    const response = await request(app).post("/users").send({});
    expect(response.status).not.toBe(401);
  });

  it("blocks protected users routes without token", async () => {
    const list = await request(app).get("/users");
    const getById = await request(app).get("/users/test-id");
    const update = await request(app).put("/users/test-id").send({});
    const remove = await request(app).delete("/users/test-id");

    expect(list.status).toBe(401);
    expect(getById.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(list.body).toEqual({ message: "Token não informado." });
  });

  it("returns 401 with invalid token on protected route", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "Bearer token-invalido");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Token inválido ou expirado." });
  });
});

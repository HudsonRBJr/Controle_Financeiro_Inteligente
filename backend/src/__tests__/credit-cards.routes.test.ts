import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Credit cards routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("requires auth for all credit-cards endpoints", async () => {
    const create = await request(app).post("/credit-cards").send({});
    const list = await request(app).get("/credit-cards");
    const getById = await request(app).get("/credit-cards/test-id");
    const update = await request(app).put("/credit-cards/test-id").send({});
    const remove = await request(app).delete("/credit-cards/test-id");

    expect(create.status).toBe(401);
    expect(list.status).toBe(401);
    expect(getById.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(update.body).toEqual({ message: "Token não informado." });
  });
});

import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Budgets routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("requires auth for all budgets endpoints", async () => {
    const create = await request(app).post("/budgets").send({});
    const list = await request(app).get("/budgets");
    const getById = await request(app).get("/budgets/test-id");
    const update = await request(app).put("/budgets/test-id").send({});
    const remove = await request(app).delete("/budgets/test-id");

    expect(create.status).toBe(401);
    expect(list.status).toBe(401);
    expect(getById.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(list.body).toEqual({ message: "Token não informado." });
  });
});

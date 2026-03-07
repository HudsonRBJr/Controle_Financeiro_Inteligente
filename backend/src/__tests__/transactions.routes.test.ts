import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Transactions routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("requires auth for all transactions endpoints", async () => {
    const create = await request(app).post("/transactions").send({});
    const list = await request(app).get("/transactions");
    const getById = await request(app).get("/transactions/test-id");
    const update = await request(app).put("/transactions/test-id").send({});
    const remove = await request(app).delete("/transactions/test-id");

    expect(create.status).toBe(401);
    expect(list.status).toBe(401);
    expect(getById.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(create.body).toEqual({ message: "Token não informado." });
  });
});

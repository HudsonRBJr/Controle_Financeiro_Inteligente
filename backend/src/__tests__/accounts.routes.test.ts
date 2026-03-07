import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Accounts routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("requires auth for all accounts endpoints", async () => {
    const create = await request(app).post("/accounts").send({});
    const list = await request(app).get("/accounts");
    const getById = await request(app).get("/accounts/test-id");
    const update = await request(app).put("/accounts/test-id").send({});
    const remove = await request(app).delete("/accounts/test-id");

    expect(create.status).toBe(401);
    expect(list.status).toBe(401);
    expect(getById.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(getById.body).toEqual({ message: "Token não informado." });
  });
});

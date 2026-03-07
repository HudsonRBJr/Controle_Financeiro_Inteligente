import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Categories routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("requires auth for all categories endpoints", async () => {
    const create = await request(app).post("/categories").send({});
    const list = await request(app).get("/categories");
    const getById = await request(app).get("/categories/test-id");
    const update = await request(app).put("/categories/test-id").send({});
    const remove = await request(app).delete("/categories/test-id");

    expect(create.status).toBe(401);
    expect(list.status).toBe(401);
    expect(getById.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(remove.body).toEqual({ message: "Token não informado." });
  });
});

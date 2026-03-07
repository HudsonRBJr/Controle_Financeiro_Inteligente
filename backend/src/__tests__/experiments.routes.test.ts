import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Experiments routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("requires auth for all experiments endpoints", async () => {
    const create = await request(app).post("/experiments").send({});
    const list = await request(app).get("/experiments");
    const getById = await request(app).get("/experiments/test-id");
    const update = await request(app).put("/experiments/test-id").send({});
    const remove = await request(app).delete("/experiments/test-id");
    const assign = await request(app).post("/experiments/test-id/assign").send({});
    const assignment = await request(app).get("/experiments/test-id/assignment");

    expect(create.status).toBe(401);
    expect(list.status).toBe(401);
    expect(getById.status).toBe(401);
    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(assign.status).toBe(401);
    expect(assignment.status).toBe(401);
    expect(assign.body).toEqual({ message: "Token não informado." });
  });
});

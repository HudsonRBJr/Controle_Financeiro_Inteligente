import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Configurations routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("keeps configuration routes public (no auth middleware)", async () => {
    const getRes = await request(app).get("/configurations");
    const postRes = await request(app).post("/configurations").send({});
    const putRes = await request(app).put("/configurations").send({});

    expect(getRes.status).not.toBe(401);
    expect(postRes.status).not.toBe(401);
    expect(putRes.status).not.toBe(401);
  });
});

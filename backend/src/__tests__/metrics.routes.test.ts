import request from "supertest";
import type { Express } from "express";
import { getTestApp } from "./helpers/test-app";

describe("Metrics routes", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("keeps GET /metrics/dashboard public (does not require token)", async () => {
    const response = await request(app).get("/metrics/dashboard");
    expect(response.status).not.toBe(401);
  });

  it("requires auth for protected metrics endpoints", async () => {
    const record = await request(app).post("/metrics/events").send({ eventType: "CLICK" });
    const ctr = await request(app).get("/metrics/experiments/test-id/ctr");
    const timeInApp = await request(app).get("/metrics/experiments/test-id/time-in-app");
    const summary = await request(app).get("/metrics/experiments/test-id/summary");

    expect(record.status).toBe(401);
    expect(ctr.status).toBe(401);
    expect(timeInApp.status).toBe(401);
    expect(summary.status).toBe(401);
    expect(record.body).toEqual({ message: "Token não informado." });
  });
});

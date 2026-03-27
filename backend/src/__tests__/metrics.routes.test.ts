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

  it("allows /metrics/events without auth and without userId", async () => {
    const record = await request(app).post("/metrics/events").send({ eventType: "CLICK" });
    expect(record.status).not.toBe(401);
  });

  it("keeps experiment metrics endpoints public", async () => {
    const ctr = await request(app).get("/metrics/experiments/test-id/ctr");
    const timeInApp = await request(app).get("/metrics/experiments/test-id/time-in-app");
    const summary = await request(app).get("/metrics/experiments/test-id/summary");

    expect(ctr.status).not.toBe(401);
    expect(timeInApp.status).not.toBe(401);
    expect(summary.status).not.toBe(401);
  });
});

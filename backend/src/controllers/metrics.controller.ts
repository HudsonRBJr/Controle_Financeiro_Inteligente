import { Request, Response } from "express";
import { RecordMetricEventInput } from "../interfaces/experiment";
import { MetricsService } from "../services/metrics.service";
import { AuthenticatedUser } from "../interfaces/auth";

const metricsService = new MetricsService();

const VALID_EVENT_TYPES = ["CLICK", "IMPRESSION", "SCREEN_VIEW", "SESSION_START", "SESSION_END"];

export class MetricsController {
  async recordEvent(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const body = req.body as RecordMetricEventInput;

    if (!body.eventType || !VALID_EVENT_TYPES.includes(body.eventType)) {
      return res.status(400).json({
        message: "eventType é obrigatório e deve ser um de: " + VALID_EVENT_TYPES.join(", "),
      });
    }

    try {
      const event = await metricsService.recordEvent(authUser!.id, body);
      return res.status(201).json(event);
    } catch (error) {
      throw error;
    }
  }

  async getCtr(req: Request, res: Response) {
    const { id: experimentId } = req.params as { id: string };
    const data = await metricsService.getCtrByExperiment(experimentId);
    return res.json({ experimentId, byVariant: data });
  }

  async getTimeInApp(req: Request, res: Response) {
    const { id: experimentId } = req.params as { id: string };
    const data = await metricsService.getTimeInAppByExperiment(experimentId);
    return res.json({ experimentId, byVariant: data });
  }

  async getSummary(req: Request, res: Response) {
    const { id: experimentId } = req.params as { id: string };
    const data = await metricsService.getSummaryByExperiment(experimentId);
    return res.json({ experimentId, summary: data });
  }
}

import { Router } from "express";
import { MetricsController } from "../controllers/metrics.controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const router = Router();
const controller = new MetricsController();

router.get("/dashboard", controller.getDashboard.bind(controller));


router.post("/events", controller.recordEvent.bind(controller));
router.get("/experiments/:id/ctr", controller.getCtr.bind(controller));
router.get("/experiments/:id/time-in-app", controller.getTimeInApp.bind(controller));
router.get("/experiments/:id/summary", controller.getSummary.bind(controller));

export default router;

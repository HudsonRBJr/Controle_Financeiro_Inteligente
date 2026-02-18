import { Router } from "express";
import { ExperimentController } from "../controllers/experiment.controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const router = Router();
const controller = new ExperimentController();

router.use(ensureAuthenticated);

router.post("/", controller.create.bind(controller));
router.get("/", controller.list.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));
router.post("/:id/assign", controller.getOrAssignVariant.bind(controller));
router.get("/:id/assignment", controller.getAssignment.bind(controller));

export default router;

import { Router } from "express";
import { ConfigurationController } from "../controllers/configuration.controller";

const router = Router();
const controller = new ConfigurationController();

router.get("/", controller.get.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/", controller.update.bind(controller));

export default router;

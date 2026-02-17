import { Router } from "express";
import { BudgetController } from "../controllers/budget.controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const router = Router();
const controller = new BudgetController();

router.use(ensureAuthenticated);

router.post("/", controller.create.bind(controller));
router.get("/", controller.list.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;

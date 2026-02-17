import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const router = Router();
const controller = new UserController();

// Cadastro é público
router.post("/", controller.create.bind(controller));

// Demais operações exigem usuário autenticado
router.use(ensureAuthenticated);

router.get("/", controller.list.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;

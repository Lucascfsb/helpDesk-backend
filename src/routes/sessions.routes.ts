import { Router } from "express";
import { SessionsController } from "@/controllers/SessionsController";

const sessionsRoutes = Router();
const authController = new SessionsController();

sessionsRoutes.post("/", authController.login);

export { sessionsRoutes };

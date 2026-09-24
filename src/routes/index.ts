import { Router } from "express";
import { sessionsRoutes } from "@/routes/sessions.routes";

const routes = Router();

routes.use("/sessions", sessionsRoutes);

export { routes };

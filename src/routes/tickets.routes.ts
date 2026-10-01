import { Router } from "express";
import { TicketsController } from "@/controllers/TicketsController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const ticketsRoutes = Router();
const ticketsController = new TicketsController();

ticketsRoutes.use(ensureAuthenticated);

ticketsRoutes.post("/", verifyUserRole(["CUSTOMER"]), ticketsController.create);

ticketsRoutes.get("/", ticketsController.index);

ticketsRoutes.post("/:id/services", ticketsController.addService);
ticketsRoutes.patch("/:id/services", ticketsController.addService);

ticketsRoutes.patch("/:id/status", ticketsController.updateStatus);

export { ticketsRoutes };

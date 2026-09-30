import { Router } from "express";
import { TicketsController } from "@/controllers/TicketsController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const ticketsRoutes = Router();
const ticketsController = new TicketsController();

ticketsRoutes.use(ensureAuthenticated);

ticketsRoutes.post("/", ticketsController.create);
ticketsRoutes.get("/", ticketsController.index);

ticketsRoutes.patch(
  "/:id/status",
  verifyUserRole("ADMIN"),
  verifyUserRole("TECHNICIAN"),
  ticketsController.updateStatus,
);

export { ticketsRoutes };

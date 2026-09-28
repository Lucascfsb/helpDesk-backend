import { Router } from "express";
import { TicketsController } from "@/controllers/TicketsController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const ticketsRoutes = Router();
const ticketsController = new TicketsController();

ticketsRoutes.use(ensureAuthenticated);

ticketsRoutes.get("/", ticketsController.index);

ticketsRoutes.post("/", verifyUserRole("CUSTOMER"), ticketsController.create);

ticketsRoutes.patch(
  "/:id/services",
  verifyUserRole("TECHNICIAN"),
  ticketsController.addServices,
);

ticketsRoutes.patch("/:id/status", ticketsController.updateStatus);

export { ticketsRoutes };

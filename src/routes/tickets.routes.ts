import { Router } from "express";
import { TicketsController } from "@/controllers/TicketsController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const ticketsRoutes = Router();
const ticketsController = new TicketsController();

ticketsRoutes.use(ensureAuthenticated);

// Apenas CUSTOMER cria chamados
ticketsRoutes.post("/", verifyUserRole("CUSTOMER"), ticketsController.create);

// Listagem de chamados
ticketsRoutes.get("/", ticketsController.index);

// Adicionar serviços extras ao chamado (Apenas ADMIN e TECHNICIAN via PATCH)
ticketsRoutes.patch(
  "/:id/services",
  verifyUserRole(["ADMIN", "TECHNICIAN"]),
  ticketsController.addServices,
);

// Atualizar status do chamado (Apenas ADMIN e TECHNICIAN)
ticketsRoutes.patch(
  "/:id/status",
  verifyUserRole(["ADMIN", "TECHNICIAN"]),
  ticketsController.updateStatus,
);

export { ticketsRoutes };

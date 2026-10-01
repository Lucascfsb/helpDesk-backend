import { Router } from "express";
import { TicketsController } from "@/controllers/TicketsController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated"; // Se usar middleware de autenticação

const ticketsRoutes = Router();
const ticketsController = new TicketsController();

// Aplica autenticação em todas as rotas abaixo (se aplicável)
ticketsRoutes.use(ensureAuthenticated);

ticketsRoutes.post("/", ticketsController.create);
ticketsRoutes.get("/", ticketsController.index);
ticketsRoutes.post("/:id/services", ticketsController.addService);

// Verifique a linha do .patch! Certifique-se de que o método existe no TicketsController
ticketsRoutes.patch("/:id/status", ticketsController.updateStatus);

export { ticketsRoutes };

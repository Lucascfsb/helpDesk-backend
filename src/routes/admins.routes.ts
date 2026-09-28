import { Router } from "express";
import { AdminsController } from "@/controllers/AdminsController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const adminsRoutes = Router();
const adminsController = new AdminsController();

adminsRoutes.use(ensureAuthenticated, verifyUserRole("ADMIN"));

adminsRoutes.post("/", adminsController.create);
adminsRoutes.get("/", adminsController.index);
adminsRoutes.put("/:id", adminsController.update);
adminsRoutes.delete("/:id", adminsController.delete);

export { adminsRoutes };

import { Router } from "express";
import { ServicesController } from "@/controllers/ServicesController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const servicesRoutes = Router();
const servicesController = new ServicesController();

servicesRoutes.use(ensureAuthenticated);

servicesRoutes.get("/", servicesController.index);

servicesRoutes.post("/", verifyUserRole("ADMIN"), servicesController.create);
servicesRoutes.put("/:id", verifyUserRole("ADMIN"), servicesController.update);
servicesRoutes.delete(
  "/:id",
  verifyUserRole("ADMIN"),
  servicesController.delete,
);

export { servicesRoutes };

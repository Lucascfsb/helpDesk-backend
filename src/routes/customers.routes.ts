import { Router } from "express";
import multer from "multer";
import { UPLOAD_CONFIG } from "@/configs/upload";
import { CustomersController } from "@/controllers/CustomersController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { ensureSameUserOrAdmin } from "@/middlewares/ensureSameUserOrAdmin";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const customersRoutes = Router();
const customersController = new CustomersController();
const upload = multer(UPLOAD_CONFIG.MULTER);

customersRoutes.post("/", customersController.create);

customersRoutes.use(ensureAuthenticated);

customersRoutes.get("/", verifyUserRole("ADMIN"), customersController.index);

customersRoutes.put("/:id", ensureSameUserOrAdmin, customersController.update);
customersRoutes.patch(
  "/:id/avatar",
  ensureSameUserOrAdmin,
  upload.single("avatar"),
  customersController.updateAvatar,
);

customersRoutes.delete(
  "/:id",
  verifyUserRole("ADMIN"),
  customersController.delete,
);

export { customersRoutes };

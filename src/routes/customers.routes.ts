import { Router } from "express";
import multer from "multer";
import { UPLOAD_CONFIG } from "@/configs/upload";
import { CustomersController } from "@/controllers/CustomersController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const customersRoutes = Router();
const customersController = new CustomersController();
const upload = multer(UPLOAD_CONFIG.MULTER);

customersRoutes.post("/", customersController.create);

customersRoutes.use(ensureAuthenticated);

customersRoutes.get("/", verifyUserRole("ADMIN"), customersController.index);
customersRoutes.put("/:id", customersController.update);
customersRoutes.delete(
  "/:id",
  verifyUserRole("ADMIN"),
  customersController.delete,
);
customersRoutes.patch(
  "/:id/avatar",
  upload.single("avatar"),
  customersController.updateAvatar,
);

export { customersRoutes };

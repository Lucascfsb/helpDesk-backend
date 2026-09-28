import { Router } from "express";
import multer from "multer";
import { UPLOAD_CONFIG } from "@/configs/upload";
import { TechniciansController } from "@/controllers/TechniciansController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const techniciansRoutes = Router();
const techniciansController = new TechniciansController();
const upload = multer(UPLOAD_CONFIG.MULTER);

techniciansRoutes.use(ensureAuthenticated);

techniciansRoutes.post(
  "/",
  verifyUserRole("ADMIN"),
  techniciansController.create,
);
techniciansRoutes.get("/", techniciansController.index);

techniciansRoutes.put("/:id", techniciansController.update);
techniciansRoutes.patch("/:id/password", techniciansController.updatePassword);
techniciansRoutes.patch(
  "/:id/availability",
  techniciansController.updateAvailability,
);
techniciansRoutes.patch(
  "/:id/avatar",
  upload.single("avatar"),
  techniciansController.updateAvatar,
);

export { techniciansRoutes };

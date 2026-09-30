import { Router } from "express";
import multer from "multer";
import { UPLOAD_CONFIG } from "@/configs/upload";
import { TechniciansController } from "@/controllers/TechniciansController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserRole } from "@/middlewares/verifyUserRole";
import { ensureSameUserOrAdmin } from "@/middlewares/ensureSameUserOrAdmin";

const techniciansRoutes = Router();
const techniciansController = new TechniciansController();
const upload = multer(UPLOAD_CONFIG.MULTER);

techniciansRoutes.use(ensureAuthenticated);

techniciansRoutes.post(
  "/",
  verifyUserRole("ADMIN"),
  techniciansController.create,
);

techniciansRoutes.get(
  "/",
  verifyUserRole("ADMIN"),
  techniciansController.index,
);

techniciansRoutes.put(
  "/:id",
  ensureSameUserOrAdmin,
  techniciansController.update,
);

techniciansRoutes.patch(
  "/:id/password",
  ensureSameUserOrAdmin,
  techniciansController.updatePassword,
);

techniciansRoutes.patch(
  "/:id/availability",
  ensureSameUserOrAdmin,
  techniciansController.updateAvailability,
);

techniciansRoutes.patch(
  "/:id/avatar",
  ensureSameUserOrAdmin,
  upload.single("avatar"),
  techniciansController.updateAvatar,
);

export { techniciansRoutes };

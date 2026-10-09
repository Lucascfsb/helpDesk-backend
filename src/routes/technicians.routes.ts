import { Router } from "express";
import multer from "multer";
import { UPLOAD_CONFIG } from "@/configs/upload";
import { TechniciansController } from "@/controllers/TechniciansController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { ensureSameUserOrAdmin } from "@/middlewares/ensureSameUserOrAdmin";
import { verifyUserRole } from "@/middlewares/verifyUserRole";

const techniciansRoutes = Router();
const techniciansController = new TechniciansController();
const upload = multer(UPLOAD_CONFIG.MULTER);

techniciansRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserRole("ADMIN"),
  techniciansController.create,
);

techniciansRoutes.get("/", techniciansController.index);

techniciansRoutes.use(ensureAuthenticated);

techniciansRoutes.put(
  "/:id",
  ensureSameUserOrAdmin,
  techniciansController.update,
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

techniciansRoutes.patch(
  "/password",
  ensureAuthenticated,
  verifyUserRole(["TECHNICIAN"]),
  techniciansController.updatePassword,
);

export { techniciansRoutes };

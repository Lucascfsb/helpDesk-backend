import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";

export function ensureSameUserOrAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  const { id: authenticatedUserId, role } = req.user;
  const { id: targetUserId } = req.params;

  if (role === "ADMIN") {
    return next();
  }

  if (authenticatedUserId !== targetUserId) {
    throw new AppError(
      "Acesso negado: você não tem permissão para alterar dados de outro usuário.",
      403,
    );
  }

  return next();
}

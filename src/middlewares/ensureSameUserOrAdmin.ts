import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";

export function ensureSameUserOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  const { id } = req.params;
  const { id: userId, role } = req.user;

  if (role !== "ADMIN" && id !== userId) {
    throw new AppError(
      "Acesso negado: Você não tem permissão para alterar os dados deste usuário.",
      403,
    );
  }

  return next();
}

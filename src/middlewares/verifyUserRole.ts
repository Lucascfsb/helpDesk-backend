import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";

export function verifyUserRole(allowedRoles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      throw new AppError("Acesso negado para o seu perfil.", 403);
    }

    return next();
  };
}

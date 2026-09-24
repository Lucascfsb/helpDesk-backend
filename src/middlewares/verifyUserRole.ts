import { UserRole } from "./../generated/prisma/index.d";
import { Request, Response, NextFunction } from "express";

export function verifyUserRole(roleToVerify: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || user.role !== roleToVerify) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this resource." });
    }

    return next();
  };
}

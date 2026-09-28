import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
}

export class DeleteAdminService {
  async execute({ id }: Request) {
    const admin = await prisma.user.findFirst({
      where: { id, role: "ADMIN" },
    });

    if (!admin) {
      throw new AppError("Administrador não encontrado.", 404);
    }

    await prisma.user.delete({ where: { id } });
  }
}

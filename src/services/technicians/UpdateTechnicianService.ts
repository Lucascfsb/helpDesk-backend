import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export class UpdateTechnicianService {
  async execute({ id, name, email, avatarUrl }: Request) {
    const technician = await prisma.user.findFirst({
      where: { id, role: "TECHNICIAN" },
    });

    if (!technician) {
      throw new AppError("Técnico não encontrado.", 404);
    }

    if (email && email !== technician.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email } });
      if (emailInUse) {
        throw new AppError("E-mail já está em uso.");
      }
    }

    return prisma.user.update({
      where: { id },
      data: { name, email, avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        availableHours: true,
        updatedAt: true,
      },
    });
  }
}

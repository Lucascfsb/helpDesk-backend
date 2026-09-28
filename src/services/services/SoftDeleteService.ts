import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
}

export class SoftDeleteService {
  async execute({ id }: Request) {
    const service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    return prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  price?: number;
}

export class UpdateService {
  async execute({ id, title, description, category, price }: Request) {
    const service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    return prisma.service.update({
      where: { id },
      data: { title, description, category, price },
    });
  }
}

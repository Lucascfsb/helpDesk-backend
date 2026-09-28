import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
  availableHours: string[];
}

export class UpdateTechnicianAvailabilityService {
  async execute({ id, availableHours }: Request) {
    const technician = await prisma.user.findFirst({
      where: { id, role: "TECHNICIAN" },
    });

    if (!technician) {
      throw new AppError("Técnico não encontrado.", 404);
    }

    return prisma.user.update({
      where: { id },
      data: { availableHours },
      select: {
        id: true,
        name: true,
        email: true,
        availableHours: true,
      },
    });
  }
}

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
  availableHours: string[];
}

export class UpdateTechnicianAvailabilityService {
  async execute({ id, availableHours }: Request) {
    const technician = await prisma.user.findUnique({
      where: { id },
    });

    if (!technician || technician.role !== "TECHNICIAN") {
      throw new AppError("Técnico não encontrado.", 404);
    }

    const updatedTechnician = await prisma.user.update({
      where: { id },
      data: { availableHours },
    });

    const { password: _, ...technicianWithoutPassword } = updatedTechnician;
    return technicianWithoutPassword;
  }
}

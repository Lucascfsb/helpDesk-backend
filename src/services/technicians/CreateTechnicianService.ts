import { prisma } from "@/database/prisma";
import { hash } from "bcryptjs";
import { AppError } from "@/utils/AppError";

interface Request {
  name: string;
  email: string;
  password: string;
  availableHours?: string[];
}

export class CreateTechnicianService {
  async execute({ name, email, password, availableHours }: Request) {
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    const defaultAvailableHours = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    const technician = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TECHNICIAN",
        availableHours:
          availableHours && availableHours.length > 0
            ? availableHours
            : defaultAvailableHours,
      },
    });

    const { password: _, ...technicianWithoutPassword } = technician;
    return technicianWithoutPassword;
  }
}

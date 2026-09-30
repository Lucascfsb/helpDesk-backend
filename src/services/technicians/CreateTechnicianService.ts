import { hash } from "bcryptjs";
import { prisma } from "@/database/prisma";
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
      throw new AppError("E-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    const technician = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TECHNICIAN",
        availableHours:
          availableHours && availableHours.length > 0
            ? availableHours
            : ["08:00-12:00", "13:00-17:00"],
      },
    });

    const { password: _, ...technicianWithoutPassword } = technician;
    return technicianWithoutPassword;
  }
}

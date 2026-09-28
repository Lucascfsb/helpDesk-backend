import { hash } from "bcryptjs";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

const DEFAULT_AVAILABLE_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

interface Request {
  name: string;
  email: string;
  password: string;
}

export class CreateTechnicianService {
  async execute({ name, email, password }: Request) {
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
        availableHours: DEFAULT_AVAILABLE_HOURS,
      },
    });

    const { password: _, ...technicianWithoutPassword } = technician;
    return technicianWithoutPassword;
  }
}

import { prisma } from "@/database/prisma";
import { hash } from "bcryptjs";
import { AppError } from "@/utils/AppError";

interface Request {
  name: string;
  email: string;
  password: string;
  specialty: string;
  workDays?: string[];
  workStartHour?: string;
  workEndHour?: string;
}

export class CreateTechnicianService {
  async execute({
    name,
    email,
    password,
    specialty,
    workDays,
    workStartHour,
    workEndHour,
  }: Request) {
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    const technician = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TECHNICIAN",
        specialty,
        workDays: workDays ?? ["MON", "TUE", "WED", "THU", "FRI"],
        workStartHour: workStartHour ?? "08:00",
        workEndHour: workEndHour ?? "18:00",
      },
    });

    const { password: _, ...technicianWithoutPassword } = technician;
    return technicianWithoutPassword;
  }
}

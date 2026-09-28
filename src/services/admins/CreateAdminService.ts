import { hash } from "bcryptjs";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  name: string;
  email: string;
  password: string;
}

export class CreateAdminService {
  async execute({ name, email, password }: Request) {
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("E-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }
}

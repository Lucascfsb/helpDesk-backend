import { compare, hash } from "bcryptjs";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export class UpdateTechnicianPasswordService {
  async execute({ id, oldPassword, newPassword }: Request) {
    const technician = await prisma.user.findFirst({
      where: { id, role: "TECHNICIAN" },
    });

    if (!technician) {
      throw new AppError("Técnico não encontrado.", 404);
    }

    const passwordMatch = await compare(oldPassword, technician.password);

    if (!passwordMatch) {
      throw new AppError("A senha antiga está incorreta.");
    }

    const hashedNewPassword = await hash(newPassword, 8);

    await prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });
  }
}

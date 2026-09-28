import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
  name?: string;
  email?: string;
}

export class UpdateCustomerService {
  async execute({ id, name, email }: Request) {
    const customer = await prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
    });

    if (!customer) {
      throw new AppError("Cliente não encontrado.", 404);
    }

    if (email && email !== customer.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email } });
      if (emailInUse) {
        throw new AppError("E-mail já está em uso.");
      }
    }

    return prisma.user.update({
      where: { id },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }
}

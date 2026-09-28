import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  id: string;
}

export class DeleteCustomerService {
  async execute({ id }: Request) {
    const customer = await prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
    });

    if (!customer) {
      throw new AppError("Cliente não encontrado.", 404);
    }

    await prisma.user.delete({ where: { id } });
  }
}

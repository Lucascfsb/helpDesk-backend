import { prisma } from "@/database/prisma";

export class ListCustomersService {
  async execute() {
    return prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

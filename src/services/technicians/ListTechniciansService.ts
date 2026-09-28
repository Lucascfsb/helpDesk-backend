import { prisma } from "@/database/prisma";

export class ListTechniciansService {
  async execute() {
    return prisma.user.findMany({
      where: { role: "TECHNICIAN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        availableHours: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

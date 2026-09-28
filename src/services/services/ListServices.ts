import { prisma } from "@/database/prisma";

export class ListServices {
  async execute(includeInactive = false) {
    return prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { title: "asc" },
    });
  }
}

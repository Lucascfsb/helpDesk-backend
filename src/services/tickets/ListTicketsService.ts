import { prisma } from "@/database/prisma";

interface Request {
  userId: string;
  userRole: "ADMIN" | "TECHNICIAN" | "CUSTOMER";
}

export class ListTicketsService {
  async execute({ userId, userRole }: Request) {
    let whereClause = {};

    if (userRole === "TECHNICIAN") {
      whereClause = { technicianId: userId };
    } else if (userRole === "CUSTOMER") {
      whereClause = { customerId: userId };
    }

    return prisma.ticket.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        technician: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        services: { include: { service: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

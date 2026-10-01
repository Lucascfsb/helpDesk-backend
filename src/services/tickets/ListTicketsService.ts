import { prisma } from "@/database/prisma";

interface Request {
  userId: string;
  userRole: string;
}

export class ListTicketsService {
  async execute({ userId, userRole }: Request) {
    const whereClause =
      userRole === "TECHNICIAN"
        ? { technicianId: userId }
        : userRole === "CUSTOMER"
          ? { customerId: userId }
          : {};

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        services: { include: { service: true } },
        customer: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
      },
    });

    return tickets;
  }
}

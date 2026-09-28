import { TicketStatus } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  ticketId: string;
  status: TicketStatus;
}

export class UpdateTicketStatusService {
  async execute({ ticketId, status }: Request) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    return prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
      include: {
        customer: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
        services: { include: { service: true } },
      },
    });
  }
}

import { TicketStatus } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  ticketId: string;
  status: TicketStatus;
  userId: string;
  userRole: string;
}

export class UpdateTicketStatusService {
  async execute({ ticketId, status, userId, userRole }: Request) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    if (userRole !== "ADMIN" && ticket.technicianId !== userId) {
      throw new AppError(
        "Acesso negado: Você só pode alterar o status de chamados atribuídos a você.",
        403,
      );
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });

    return updatedTicket;
  }
}

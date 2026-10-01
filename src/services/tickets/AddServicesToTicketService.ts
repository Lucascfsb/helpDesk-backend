import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  ticketId: string;
  serviceId: string;
}

export class AddServiceToTicketService {
  async execute({ ticketId, serviceId }: Request) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      throw new AppError("Serviço não encontrado ou inativo.", 400);
    }

    const ticketServiceExists = await prisma.ticketService.findUnique({
      where: {
        ticketId_serviceId: {
          ticketId,
          serviceId,
        },
      },
    });

    if (ticketServiceExists) {
      throw new AppError("Este serviço já está vinculado a este chamado.");
    }

    const ticketService = await prisma.ticketService.create({
      data: {
        ticketId,
        serviceId,
        price: service.price,
      },
      include: {
        service: true,
      },
    });

    return ticketService;
  }
}

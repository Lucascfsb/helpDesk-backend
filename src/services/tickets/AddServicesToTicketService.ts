import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  ticketId: string;
  technicianId: string;
  userRole?: string;
  serviceIds: string[];
}

export class AddServicesToTicketService {
  async execute({ ticketId, technicianId, serviceIds, userRole }: Request) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    if (userRole !== "ADMIN" && ticket.technicianId !== technicianId) {
      throw new AppError(
        "Acesso negado: Você só pode adicionar serviços aos chamados atribuídos a você.",
        403,
      );
    }

    if (ticket.technicianId !== technicianId) {
      throw new AppError(
        "Apenas o técnico responsável pode alterar este chamado.",
        403,
      );
    }

    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
      },
    });

    if (services.length === 0) {
      throw new AppError("Nenhum serviço válido foi selecionado.", 400);
    }

    const ticketServicesData = services.map((service) => ({
      ticketId,
      serviceId: service.id,
      price: service.price,
    }));

    await prisma.ticketService.createMany({
      data: ticketServicesData,
      skipDuplicates: true,
    });

    return prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { services: { include: { service: true } } },
    });
  }
}

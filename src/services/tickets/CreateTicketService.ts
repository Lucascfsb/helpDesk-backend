import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

interface Request {
  title: string;
  description?: string;
  scheduledAt: Date;
  customerId: string;
  technicianId: string;
  serviceIds: string[];
}

export class CreateTicketService {
  async execute({
    title,
    description,
    scheduledAt,
    customerId,
    technicianId,
    serviceIds,
  }: Request) {
    const technician = await prisma.user.findFirst({
      where: { id: technicianId, role: "TECHNICIAN" },
    });

    if (!technician) {
      throw new AppError("Técnico selecionado é inválido.", 400);
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length === 0) {
      throw new AppError("Selecione pelo menos um serviço válido.", 400);
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        scheduledAt,
        customerId,
        technicianId,
        services: {
          create: services.map((service) => ({
            serviceId: service.id,
            price: service.price,
          })),
        },
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
        services: { include: { service: true } },
      },
    });

    return ticket;
  }
}

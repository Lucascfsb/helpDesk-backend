import { Request, Response } from "express";
import { z } from "zod";
import { CreateTicketService } from "@/services/tickets/CreateTicketService";
import { AddServiceToTicketService } from "@/services/tickets/AddServicesToTicketService";
import { UpdateTicketStatusService } from "@/services/tickets/UpdateTicketStatusService";
import { ListTicketsService } from "@/services/tickets/ListTicketsService";
import { prisma } from "@/database/prisma";

export class TicketsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      scheduledAt: z.string().datetime(),
      technicianId: z.string().uuid(),
      serviceIds: z.array(z.string().uuid()).min(1),
    });

    const { title, description, scheduledAt, technicianId, serviceIds } =
      bodySchema.parse(req.body);

    const customerId = req.user.id;

    const createTicketService = new CreateTicketService();
    const ticket = await createTicketService.execute({
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      customerId,
      technicianId,
      serviceIds,
      userRole: req.user.role,
    });

    return res.status(201).json(ticket);
  }

  async index(req: Request, res: Response) {
    const listTicketsService = new ListTicketsService();
    const tickets = await listTicketsService.execute({
      userId: req.user.id,
      userRole: req.user.role,
    });

    return res.json(tickets);
  }

  async addService(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.string().uuid() });

    const bodySchema = z.object({
      serviceId: z.string().uuid().optional(),
      serviceIds: z.array(z.string().uuid()).optional(),
    });

    const { id: ticketId } = paramsSchema.parse(req.params);
    const { serviceId, serviceIds } = bodySchema.parse(req.body);

    const targetServiceIds = serviceIds || (serviceId ? [serviceId] : []);

    const addServiceToTicketService = new AddServiceToTicketService();

    for (const sId of targetServiceIds) {
      await addServiceToTicketService.execute({ ticketId, serviceId: sId });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        services: { include: { service: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Chamado não encontrado." });
    }

    return res.status(200).json(ticket);
  }

  async updateStatus(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({
      status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
    });

    const { id } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    const updateTicketStatusService = new UpdateTicketStatusService();
    const updatedTicket = await updateTicketStatusService.execute({
      ticketId: id,
      status,
      userId: req.user.id,
      userRole: req.user.role,
    });

    return res.json(updatedTicket);
  }
}

import { Request, Response } from "express";
import { z } from "zod";
import { TicketStatus } from "@prisma/client";
import { CreateTicketService } from "@/services/tickets/CreateTicketService";
import { ListTicketsService } from "@/services/tickets/ListTicketsService";
import { AddServicesToTicketService } from "@/services/tickets/AddServicesToTicketService";
import { UpdateTicketStatusService } from "@/services/tickets/UpdateTicketStatusService";
import { AppError } from "@/utils/AppError";

export class TicketsController {
  async create(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Utilizador não autenticado.", 401);
    }

    const schema = z.object({
      title: z.string().min(1, "Título é obrigatório"),
      description: z.string().optional(),
      scheduledAt: z.iso.datetime().or(z.string().min(1)),
      technicianId: z.uuid("ID do técnico inválido"),
      serviceIds: z.array(z.uuid()).min(1, "Selecione pelo menos um serviço"),
    });

    const { title, description, scheduledAt, technicianId, serviceIds } =
      schema.parse(req.body);

    const customerId = req.user.id;

    const createTicketService = new CreateTicketService();
    const ticket = await createTicketService.execute({
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      customerId,
      technicianId,
      serviceIds,
    });

    return res.status(201).json(ticket);
  }

  async index(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Utilizador não autenticado.", 401);
    }

    const { id: userId, role: userRole } = req.user;

    const listTicketsService = new ListTicketsService();
    const tickets = await listTicketsService.execute({ userId, userRole });

    return res.json(tickets);
  }

  async addServices(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Utilizador não autenticado.", 401);
    }

    const paramsSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({
      serviceIds: z.array(z.uuid()).min(1),
    });

    const { id: ticketId } = paramsSchema.parse(req.params);
    const { serviceIds } = bodySchema.parse(req.body);
    const technicianId = req.user.id;

    const addServicesService = new AddServicesToTicketService();
    const updatedTicket = await addServicesService.execute({
      ticketId,
      technicianId,
      serviceIds,
    });

    return res.json(updatedTicket);
  }

  async updateStatus(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const bodySchema = z.object({
      status: z.enum(TicketStatus),
    });

    const { id: ticketId } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    const updateStatusService = new UpdateTicketStatusService();
    const updatedTicket = await updateStatusService.execute({
      ticketId,
      status,
    });

    return res.json(updatedTicket);
  }
}

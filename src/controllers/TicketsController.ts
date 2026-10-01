import { Request, Response } from "express";
import { z } from "zod";
import { CreateTicketService } from "@/services/tickets/CreateTicketService";
import { AddServiceToTicketService } from "@/services/tickets/AddServicesToTicketService";
import { UpdateTicketStatusService } from "@/services/tickets/UpdateTicketStatusService";
import { ListTicketsService } from "@/services/tickets/ListTicketsService";

export class TicketsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      scheduledAt: z.iso.datetime(),
      technicianId: z.uuid(),
      serviceIds: z.array(z.uuid()).min(1),
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
    const paramsSchema = z.object({ id: z.uuid() });
    const bodySchema = z.object({ serviceId: z.uuid() });

    const { id: ticketId } = paramsSchema.parse(req.params);
    const { serviceId } = bodySchema.parse(req.body);

    const addServiceToTicketService = new AddServiceToTicketService();
    const updatedTicketService = await addServiceToTicketService.execute({
      ticketId,
      serviceId,
    });

    return res.status(201).json(updatedTicketService);
  }

  async updateStatus(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
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

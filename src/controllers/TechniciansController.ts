import { Request, Response } from "express";
import { z } from "zod";
import { CreateTechnicianService } from "@/services/technicians/CreateTechnicianService";
import { ListTechniciansService } from "@/services/technicians/ListTechniciansService";
import { UpdateTechnicianService } from "@/services/technicians/UpdateTechnicianService";
import { UpdateTechnicianPasswordService } from "@/services/technicians/UpdateTechnicianPasswordService";
import { UpdateTechnicianAvailabilityService } from "@/services/technicians/UpdateTechnicianAvailabilityService";
import { UpdateUserAvatarService } from "@/services/users/UpdateUserAvatarService";

export class TechniciansController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      email: z.email("E-mail inválido"),
      password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    const createTechnicianService = new CreateTechnicianService();
    const technician = await createTechnicianService.execute({
      name,
      email,
      password,
    });

    return res.status(201).json(technician);
  }

  async index(_req: Request, res: Response) {
    const listTechniciansService = new ListTechniciansService();
    const technicians = await listTechniciansService.execute();

    return res.json(technicians);
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const bodySchema = z.object({
      name: z.string().min(1).optional(),
      email: z.email().optional(),
      avatarUrl: z.url().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const { name, email, avatarUrl } = bodySchema.parse(req.body);

    const updateTechnicianService = new UpdateTechnicianService();
    const technician = await updateTechnicianService.execute({
      id,
      name,
      email,
      avatarUrl,
    });

    return res.json(technician);
  }

  async updatePassword(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const bodySchema = z.object({
      oldPassword: z.string(),
      newPassword: z
        .string()
        .min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    });

    const { id } = paramsSchema.parse(req.params);
    const { oldPassword, newPassword } = bodySchema.parse(req.body);

    const updatePasswordService = new UpdateTechnicianPasswordService();
    await updatePasswordService.execute({ id, oldPassword, newPassword });

    return res.status(204).send();
  }

  async updateAvatar(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const { id } = paramsSchema.parse(req.params);

    const updateUserAvatar = new UpdateUserAvatarService();
    const technician = await updateUserAvatar.execute({
      userId: id,
      avatarFilename: req.file?.filename || "",
    });

    return res.json(technician);
  }

  async updateAvailability(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const bodySchema = z.object({
      availableHours: z.array(z.string()),
    });

    const { id } = paramsSchema.parse(req.params);
    const { availableHours } = bodySchema.parse(req.body);

    const updateAvailabilityService = new UpdateTechnicianAvailabilityService();
    const technician = await updateAvailabilityService.execute({
      id,
      availableHours,
    });

    return res.json(technician);
  }
}

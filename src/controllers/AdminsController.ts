import { Request, Response } from "express";
import { z } from "zod";
import { CreateAdminService } from "@/services/admins/CreateAdminService";
import { ListAdminsService } from "@/services/admins/ListAdminsService";
import { UpdateAdminService } from "@/services/admins/UpdateAdminService";
import { DeleteAdminService } from "@/services/admins/DeleteAdminService";

export class AdminsController {
  async create(req: Request, res: Response) {
    const createAdminBodySchema = z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      email: z.email("E-mail inválido"),
      password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    });

    const { name, email, password } = createAdminBodySchema.parse(req.body);

    const createAdminService = new CreateAdminService();
    const admin = await createAdminService.execute({ name, email, password });

    return res.status(201).json(admin);
  }

  async index(_req: Request, res: Response) {
    const listAdminsService = new ListAdminsService();
    const admins = await listAdminsService.execute();

    return res.json(admins);
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({
      name: z.string().min(1).optional(),
      email: z.email().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const { name, email } = bodySchema.parse(req.body);

    const updateAdminService = new UpdateAdminService();
    const admin = await updateAdminService.execute({ id, name, email });

    return res.json(admin);
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(req.params);

    const deleteAdminService = new DeleteAdminService();
    await deleteAdminService.execute({ id });

    return res.status(204).send();
  }
}

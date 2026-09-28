import { Request, Response } from "express";
import { z } from "zod";
import { CreateService } from "@/services/services/CreateService";
import { ListServices } from "@/services/services/ListServices";
import { UpdateService } from "@/services/services/UpdateService";
import { SoftDeleteService } from "@/services/services/SoftDeleteService";

export class ServicesController {
  async create(req: Request, res: Response) {
    const schema = z.object({
      title: z.string().min(1, "Título é obrigatório"),
      description: z.string().optional(),
      category: z.string().min(1, "Categoria é obrigatória"),
      price: z.number().positive("Preço deve ser maior que zero"),
    });

    const { title, description, category, price } = schema.parse(req.body);

    const createService = new CreateService();
    const service = await createService.execute({
      title,
      description,
      category,
      price,
    });

    return res.status(201).json(service);
  }

  async index(_req: Request, res: Response) {
    const listServices = new ListServices();
    const services = await listServices.execute();

    return res.json(services);
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      price: z.number().positive().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    const updateService = new UpdateService();
    const service = await updateService.execute({ id, ...data });

    return res.json(service);
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(req.params);

    const softDeleteService = new SoftDeleteService();
    await softDeleteService.execute({ id });

    return res.status(204).send();
  }
}

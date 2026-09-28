import { Request, Response } from "express";
import { z } from "zod";
import { CreateCustomerService } from "@/services/customers/CreateCustomerService";
import { ListCustomersService } from "@/services/customers/ListCustomersService";
import { UpdateCustomerService } from "@/services/customers/UpdateCustomerService";
import { DeleteCustomerService } from "@/services/customers/DeleteCustomerService";
import { UpdateUserAvatarService } from "@/services/users/UpdateUserAvatarService";

export class CustomersController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      email: z.string().email("E-mail inválido"),
      password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    const createCustomerService = new CreateCustomerService();
    const customer = await createCustomerService.execute({
      name,
      email,
      password,
    });

    return res.status(201).json(customer);
  }

  async index(_req: Request, res: Response) {
    const listCustomersService = new ListCustomersService();
    const customers = await listCustomersService.execute();

    return res.json(customers);
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const bodySchema = z.object({
      name: z.string().min(1).optional(),
      email: z.email().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const { name, email } = bodySchema.parse(req.body);

    const updateCustomerService = new UpdateCustomerService();
    const customer = await updateCustomerService.execute({ id, name, email });

    return res.json(customer);
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const { id } = paramsSchema.parse(req.params);

    const deleteCustomerService = new DeleteCustomerService();
    await deleteCustomerService.execute({ id });

    return res.status(204).send();
  }

  async updateAvatar(req: Request, res: Response) {
    const paramsSchema = z.object({ id: z.uuid() });
    const { id } = paramsSchema.parse(req.params);

    const updateUserAvatarService = new UpdateUserAvatarService();
    const user = await updateUserAvatarService.execute({
      userId: id,
      avatarFilename: req.file?.filename || "",
    });

    return res.json(user);
  }
}

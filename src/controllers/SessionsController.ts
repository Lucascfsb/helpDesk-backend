import { Request, Response } from "express";
import { z } from "zod";
import { AuthenticateUserService } from "@/services/sessions/SessionsUserService";

export class SessionsController {
  async login(req: Request, res: Response) {
    const loginSchema = z.object({
      email: z.email("E-mail inválido."),
      password: z.string().min(1, "A senha é obrigatória."),
    });

    const { email, password } = loginSchema.parse(req.body);

    const authenticateUserService = new AuthenticateUserService();

    const result = await authenticateUserService.execute({
      email,
      password,
    });

    return res.json(result);
  }
}

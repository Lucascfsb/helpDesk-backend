import { compare } from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { authConfig } from "../../configs/authConfig";
import { prisma } from "../../database/prisma";
import { AppError } from "../../utils/AppError";

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

interface AuthenticateUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export class AuthenticateUserService {
  async execute({
    email,
    password,
  }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("E-mail ou senha incorretos.", 401);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("E-mail ou senha incorretos.", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign(
      { role: user.role ?? "MEMBER" },
      secret as Secret,
      {
        subject: String(user.id),
        expiresIn,
      } as SignOptions,
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}

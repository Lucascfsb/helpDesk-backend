import { prisma } from "@/database/prisma";

interface Request {
  title: string;
  description: string;
  price: number;
}

export class CreateService {
  async execute({ title, description, price }: Request) {
    return prisma.service.create({
      data: { title, description, price },
    });
  }
}

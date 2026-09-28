import { prisma } from "@/database/prisma";

interface Request {
  title: string;
  description?: string;
  category: string;
  price: number;
}

export class CreateService {
  async execute({ title, description, category, price }: Request) {
    return prisma.service.create({
      data: {
        title,
        description,
        category,
        price,
      },
    });
  }
}

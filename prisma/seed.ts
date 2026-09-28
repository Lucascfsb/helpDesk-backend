import { prisma } from "../src/database/prisma";
import { UserRole } from "../src/generated/prisma";
import { hash } from "bcryptjs";

async function main() {
  await prisma.ticketService.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("123456", 8);

  await prisma.user.create({
    data: {
      name: "Admin Principal",
      email: "admin@email.com",
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        name: "Técnico Carlos",
        email: "carlos@tech.com",
        password: passwordHash,
        role: UserRole.TECHNICIAN,
        availableHours: ["08:00", "09:00", "10:00", "11:00"],
      },
      {
        name: "Técnica Ana",
        email: "ana@tech.com",
        password: passwordHash,
        role: UserRole.TECHNICIAN,
        availableHours: ["13:00", "14:00", "15:00", "16:00"],
      },
      {
        name: "Técnico Roberto",
        email: "roberto@tech.com",
        password: passwordHash,
        role: UserRole.TECHNICIAN,
        availableHours: ["08:00", "10:00", "14:00", "16:00"],
      },
    ],
  });

  await prisma.service.createMany({
    data: [
      {
        title: "Formatação e Instalação de SO",
        description: "Formatação completa com backup e instalação do SO.",
        category: "Software",
        price: 150.0,
      },
      {
        title: "Limpeza Interna e Troca de Pasta Térmica",
        description: "Manutenção preventiva e limpeza de componentes.",
        category: "Hardware",
        price: 120.0,
      },
      {
        title: "Troca de Tela de Notebook",
        description: "Substituição de display danificado por peça nova.",
        category: "Hardware",
        price: 350.0,
      },
      {
        title: "Configuração de Rede e Roteador",
        description: "Instalação de rede Wi-Fi e cabeada.",
        category: "Redes",
        price: 200.0,
      },
      {
        title: "Remoção de Vírus e Malwares",
        description: "Varredura profunda e otimização do sistema.",
        category: "Software",
        price: 100.0,
      },
    ],
  });

  console.log("Seed executada com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

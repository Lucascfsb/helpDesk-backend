import request from "supertest";
import { hash } from "bcryptjs";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Módulo de Autenticação (Sessions)", () => {
  beforeAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("123456", 8);

    await prisma.user.create({
      data: {
        name: "Usuario Auth Teste",
        email: "teste@teste.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Deve autenticar com credenciais válidas e retornar o token JWT", async () => {
    const response = await request(app).post("/sessions").send({
      email: "teste@teste.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Não deve autenticar com senha incorreta", async () => {
    const response = await request(app).post("/sessions").send({
      email: "teste@teste.com",
      password: "senha_errada",
    });

    expect(response.status).toBe(401);
  });

  it("Não deve autenticar com e-mail inexistente", async () => {
    const response = await request(app).post("/sessions").send({
      email: "inexistente@teste.com",
      password: "123456",
    });

    expect(response.status).toBe(401);
  });
});

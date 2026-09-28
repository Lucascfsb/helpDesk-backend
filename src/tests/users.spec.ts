import request from "supertest";
import { hash } from "bcryptjs";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Módulo de Usuários (Admin, Técnico, Cliente)", () => {
  let adminToken: string;

  beforeAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("123456", 8);

    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin.user@teste.com",
        password: passwordHash,
        role: "ADMIN",
      },
    });

    const loginAdmin = await request(app).post("/sessions").send({
      email: "admin.user@teste.com",
      password: "123456",
    });

    adminToken = loginAdmin.body.token || loginAdmin.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Deve cadastrar um novo Cliente (cadastro aberto)", async () => {
    const response = await request(app).post("/customers").send({
      name: "Cliente Novo",
      email: "cliente.novo@teste.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.role).toBe("CUSTOMER");
  });

  it("Admin deve criar um novo Técnico com faixas de horário", async () => {
    const response = await request(app)
      .post("/technicians")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Técnico Especialista",
        email: "tecnico.especialista@teste.com",
        password: "123456",
        availableHours: ["08:00", "10:00", "14:00"],
      });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("TECHNICIAN");
    expect(response.body.availableHours).toContain("08:00");
  });

  it("Não deve permitir criar usuário com e-mail já cadastrado", async () => {
    const response = await request(app).post("/customers").send({
      name: "Cliente Duplicado",
      email: "cliente.novo@teste.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
  });
});

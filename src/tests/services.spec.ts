import request from "supertest";
import { hash } from "bcryptjs";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Módulo de Serviços", () => {
  let adminToken: string;
  let customerToken: string;
  let createdServiceId: string;

  beforeAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("123456", 8);

    await prisma.user.create({
      data: {
        name: "Admin Service",
        email: "admin.service@teste.com",
        password: passwordHash,
        role: "ADMIN",
      },
    });

    const loginAdmin = await request(app).post("/sessions").send({
      email: "admin.service@teste.com",
      password: "123456",
    });
    adminToken = loginAdmin.body.token || loginAdmin.body.accessToken;

    await prisma.user.create({
      data: {
        name: "Cliente Service",
        email: "cliente.service@teste.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });

    const loginCust = await request(app).post("/sessions").send({
      email: "cliente.service@teste.com",
      password: "123456",
    });
    customerToken = loginCust.body.token || loginCust.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Admin deve criar um novo Serviço", async () => {
    const response = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Manutenção de Hardware",
        description: "Troca de peças e limpeza",
        category: "Hardware",
        price: 200,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.category).toBe("Hardware");
    createdServiceId = response.body.id;
  });

  it("Cliente deve conseguir listar os serviços ativos", async () => {
    const response = await request(app)
      .get("/services")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("Admin deve atualizar um serviço existente", async () => {
    const response = await request(app)
      .put(`/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Manutenção Preventiva de Hardware",
        description: "Troca de pasta térmica, peças e limpeza completa",
        category: "Hardware",
        price: 250,
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Manutenção Preventiva de Hardware");
    expect(response.body.price).toBe("250");
  });

  it("Não deve atualizar um serviço inexistente", async () => {
    const response = await request(app)
      .put("/services/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Serviço Fantasma",
        description: "Teste de erro",
        category: "Software",
        price: 100,
      });

    expect(response.status).toBe(404);
  });

  it("Admin deve aplicar Soft Delete em um serviço", async () => {
    const response = await request(app)
      .delete(`/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

    const serviceInDb = await prisma.service.findUnique({
      where: { id: createdServiceId },
    });
    expect(serviceInDb?.isActive).toBe(false);
  });

  it("Não deve aplicar Soft Delete em um serviço inexistente", async () => {
    const response = await request(app)
      .delete("/services/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });
});

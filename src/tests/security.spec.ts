import request from "supertest";
import { hash } from "bcryptjs";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Módulo de Segurança e Autorização (RBAC & Ownership)", () => {
  let adminToken: string;
  let technician1Token: string;
  let technician2Token: string;
  let customer1Token: string;

  let customer1Id: string;
  let customer2Id: string;
  let technician1Id: string;
  let technician2Id: string;
  let ticketId: string;

  beforeAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("123456", 8);

    await prisma.user.create({
      data: {
        name: "Admin Sec",
        email: "admin.sec@teste.com",
        password: passwordHash,
        role: "ADMIN",
      },
    });
    const adminLogin = await request(app).post("/sessions").send({
      email: "admin.sec@teste.com",
      password: "123456",
    });
    adminToken = adminLogin.body.token || adminLogin.body.accessToken;

    const tech1 = await prisma.user.create({
      data: {
        name: "Técnico 1",
        email: "tech1.sec@teste.com",
        password: passwordHash,
        role: "TECHNICIAN",
      },
    });
    technician1Id = tech1.id;

    const tech1Login = await request(app).post("/sessions").send({
      email: "tech1.sec@teste.com",
      password: "123456",
    });
    technician1Token = tech1Login.body.token || tech1Login.body.accessToken;

    const tech2 = await prisma.user.create({
      data: {
        name: "Técnico 2",
        email: "tech2.sec@teste.com",
        password: passwordHash,
        role: "TECHNICIAN",
      },
    });
    technician2Id = tech2.id;

    const tech2Login = await request(app).post("/sessions").send({
      email: "tech2.sec@teste.com",
      password: "123456",
    });
    technician2Token = tech2Login.body.token || tech2Login.body.accessToken;

    const cust1 = await prisma.user.create({
      data: {
        name: "Cliente 1",
        email: "cust1.sec@teste.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });
    customer1Id = cust1.id;

    const cust1Login = await request(app).post("/sessions").send({
      email: "cust1.sec@teste.com",
      password: "123456",
    });
    customer1Token = cust1Login.body.token || cust1Login.body.accessToken;

    const cust2 = await prisma.user.create({
      data: {
        name: "Cliente 2",
        email: "cust2.sec@teste.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });
    customer2Id = cust2.id;

    const service = await prisma.service.create({
      data: {
        title: "Serviço Teste",
        description: "Descrição",
        category: "Geral",
        price: 100,
      },
    });

    const ticket = await prisma.ticket.create({
      data: {
        title: "Chamado do Cliente 1",
        scheduledAt: new Date(),
        customerId: customer1Id,
        technicianId: technician1Id,
        status: "OPEN",
        services: {
          create: {
            serviceId: service.id,
            price: service.price,
          },
        },
      },
    });
    ticketId = ticket.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Técnico NÃO deve conseguir alterar perfil de um Cliente", async () => {
    const response = await request(app)
      .put(`/customers/${customer1Id}`)
      .set("Authorization", `Bearer ${technician1Token}`)
      .send({ name: "Nome Infiltrado" });

    expect(response.status).toBe(403);
  });

  it("Cliente 1 NÃO deve conseguir alterar perfil do Cliente 2", async () => {
    const response = await request(app)
      .put(`/customers/${customer2Id}`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ name: "Ataque Cliente 2" });

    expect(response.status).toBe(403);
  });

  it("Cliente NÃO deve conseguir alterar perfil de um Técnico", async () => {
    const response = await request(app)
      .put(`/technicians/${technician1Id}`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ name: "Invasão no Técnico" });

    expect(response.status).toBe(403);
  });

  it("Técnico 2 NÃO deve conseguir alterar a disponibilidade do Técnico 1", async () => {
    const response = await request(app)
      .patch(`/technicians/${technician1Id}/availability`)
      .set("Authorization", `Bearer ${technician2Token}`)
      .send({ availableHours: ["00:00-01:00"] });

    expect(response.status).toBe(403);
  });

  it("Cliente NÃO deve conseguir alterar o status de um chamado", async () => {
    const response = await request(app)
      .patch(`/tickets/${ticketId}/status`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ status: "CLOSED" });

    expect(response.status).toBe(403);
  });

  it("Técnico NÃO responsável (Técnico 2) NÃO deve conseguir alterar o status do chamado", async () => {
    const response = await request(app)
      .patch(`/tickets/${ticketId}/status`)
      .set("Authorization", `Bearer ${technician2Token}`)
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(403);
  });

  it("Técnico responsável (Técnico 1) DEVE conseguir alterar o status do chamado", async () => {
    const response = await request(app)
      .patch(`/tickets/${ticketId}/status`)
      .set("Authorization", `Bearer ${technician1Token}`)
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("IN_PROGRESS");
  });
});

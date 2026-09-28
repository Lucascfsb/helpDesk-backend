import request from "supertest";
import { hash } from "bcryptjs";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Módulo de Chamados (Tickets)", () => {
  let adminToken: string;
  let technicianToken: string;
  let customerToken: string;

  let technicianId: string;
  let serviceId: string;
  let ticketId: string;

  beforeAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("123456", 8);

    await prisma.user.create({
      data: {
        name: "Admin Ticket",
        email: "admin.ticket@teste.com",
        password: passwordHash,
        role: "ADMIN",
      },
    });

    const adminLogin = await request(app).post("/sessions").send({
      email: "admin.ticket@teste.com",
      password: "123456",
    });
    adminToken = adminLogin.body.token || adminLogin.body.accessToken;

    const techUser = await prisma.user.create({
      data: {
        name: "Técnico Responsável",
        email: "tech.ticket@teste.com",
        password: passwordHash,
        role: "TECHNICIAN",
      },
    });
    technicianId = techUser.id;

    const techLogin = await request(app).post("/sessions").send({
      email: "tech.ticket@teste.com",
      password: "123456",
    });
    technicianToken = techLogin.body.token || techLogin.body.accessToken;

    await prisma.user.create({
      data: {
        name: "Cliente Chamado",
        email: "cliente.ticket@teste.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });

    const custLogin = await request(app).post("/sessions").send({
      email: "cliente.ticket@teste.com",
      password: "123456",
    });
    customerToken = custLogin.body.token || custLogin.body.accessToken;

    const serviceRes = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Formatação de SO",
        description: "Instalação do Windows/Linux",
        category: "Software",
        price: 150,
      });

    serviceId = serviceRes.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Cliente deve criar um novo chamado", async () => {
    const response = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        title: "Formatação Urgente",
        description: "Lentidão geral no sistema",
        scheduledAt: "2026-10-15T09:00:00.000Z",
        technicianId,
        serviceIds: [serviceId],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.status).toBe("OPEN");
    ticketId = response.body.id;
  });

  it("Bloqueio: Técnico NÃO deve conseguir criar chamados", async () => {
    const response = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${technicianToken}`)
      .send({
        title: "Criado pelo Técnico",
        scheduledAt: "2026-10-15T09:00:00.000Z",
        technicianId,
        serviceIds: [serviceId],
      });

    expect(response.status).toBe(403);
  });

  it("Técnico deve visualizar apenas os chamados atribuídos a ele", async () => {
    const response = await request(app)
      .get("/tickets")
      .set("Authorization", `Bearer ${technicianToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(ticketId);
  });

  it("Técnico deve alterar o status do chamado para IN_PROGRESS e CLOSED", async () => {
    const response = await request(app)
      .patch(`/tickets/${ticketId}/status`)
      .set("Authorization", `Bearer ${technicianToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("IN_PROGRESS");
  });

  it("Técnico deve adicionar um serviço extra ao chamado", async () => {
    const extraServiceRes = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Limpeza de Cooler",
        category: "Hardware",
        price: 50,
      });

    const response = await request(app)
      .patch(`/tickets/${ticketId}/services`)
      .set("Authorization", `Bearer ${technicianToken}`)
      .send({ serviceIds: [extraServiceRes.body.id] });

    expect(response.status).toBe(200);
    expect(response.body.services.length).toBe(2);
  });
});

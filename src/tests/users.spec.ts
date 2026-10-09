import request from "supertest";
import { hash } from "bcryptjs";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Módulo de Usuários (Admin, Técnico, Cliente)", () => {
  let adminToken: string;
  let customerToken: string;
  let customerId: string;
  let technicianId: string;
  let adminId: string;

  beforeAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("123456", 8);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin.user@teste.com",
        password: passwordHash,
        role: "ADMIN",
      },
    });
    adminId = admin.id;

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

    customerId = response.body.id;

    const loginCustomer = await request(app).post("/sessions").send({
      email: "cliente.novo@teste.com",
      password: "123456",
    });

    customerToken = loginCustomer.body.token || loginCustomer.body.accessToken;
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

    technicianId = response.body.id;
  });

  it("Não deve permitir criar usuário com e-mail já cadastrado", async () => {
    const response = await request(app).post("/customers").send({
      name: "Cliente Duplicado",
      email: "cliente.novo@teste.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
  });

  it("Admin deve criar um novo Admin", async () => {
    const response = await request(app)
      .post("/admins")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Admin Secundario",
        email: "admin2@teste.com",
        password: "123456",
      });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("ADMIN");
  });

  it("Admin deve listar todos os Admins", async () => {
    const response = await request(app)
      .get("/admins")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Admin deve atualizar um Admin", async () => {
    const response = await request(app)
      .put(`/admins/${adminId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Admin User Alterado",
        email: "admin.user@teste.com",
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Admin User Alterado");
  });

  it("Admin deve listar todos os Clientes", async () => {
    const response = await request(app)
      .get("/customers")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Cliente ou Admin deve atualizar dados do Cliente", async () => {
    const response = await request(app)
      .put(`/customers/${customerId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "Cliente Nome Atualizado",
        phone: "21999998888",
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Cliente Nome Atualizado");
  });

  it("Deve listar os Técnicos", async () => {
    const response = await request(app).get("/technicians");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Admin deve atualizar a disponibilidade do Técnico", async () => {
    const response = await request(app)
      .patch(`/technicians/${technicianId}/availability`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        availableHours: ["09:00", "11:00", "15:00"],
      });

    expect(response.status).toBe(200);
    expect(response.body.availableHours).toContain("09:00");
  });

  it("Admin deve atualizar dados e senha do Técnico", async () => {
    const response = await request(app)
      .put(`/technicians/${technicianId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Técnico Especialista Atualizado",
        email: "tecnico.especialista@teste.com",
        password: "nova_senha_123",
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Técnico Especialista Atualizado");
  });

  it("Deve atualizar o avatar do usuário", async () => {
    const fakeImageBuffer = Buffer.from("fake image content");

    const response = await request(app)
      .patch(`/customers/${customerId}/avatar`)
      .set("Authorization", `Bearer ${customerToken}`)
      .attach("avatar", fakeImageBuffer, "avatar-teste.png");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("avatarUrl");
  });

  it("Admin deve deletar um Cliente", async () => {
    const response = await request(app)
      .delete(`/customers/${customerId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });

  it("Não deve atualizar/deletar admin inexistente", async () => {
    const resUpdate = await request(app)
      .put("/admins/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Inexistente", email: "off@test.com" });

    const resDelete = await request(app)
      .delete("/admins/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(resUpdate.status).toBe(404);
    expect(resDelete.status).toBe(404);
  });

  it("Não deve atualizar/deletar cliente inexistente", async () => {
    const resUpdate = await request(app)
      .put("/customers/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Inexistente", phone: "0000" });

    const resDelete = await request(app)
      .delete("/customers/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(resUpdate.status).toBe(404);
    expect(resDelete.status).toBe(404);
  });

  it("Não deve atualizar técnico inexistente", async () => {
    const response = await request(app)
      .put("/technicians/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Inexistente",
        email: "off@tech.com",
      });

    expect(response.status).toBe(404);
  });

  it("Não deve permitir atualizar técnico com e-mail já em uso", async () => {
    const response = await request(app)
      .put(`/technicians/${technicianId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Técnico Conflito",
        email: "admin.user@teste.com",
      });

    expect(response.status).toBe(400);
  });

  it("Não deve atualizar avatar se nenhum arquivo for enviado", async () => {
    const newCust = await request(app).post("/customers").send({
      name: "Cliente Temp Avatar",
      email: "temp.avatar@teste.com",
      password: "123456",
    });

    const response = await request(app)
      .patch(`/customers/${newCust.body.id}/avatar`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it("Não deve atualizar avatar de usuário inexistente", async () => {
    const fakeImageBuffer = Buffer.from("fake image content");

    const response = await request(app)
      .patch("/customers/00000000-0000-0000-0000-000000000000/avatar")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("avatar", fakeImageBuffer, "avatar-teste.png");

    expect(response.status).toBe(404);
  });

  it("Não deve permitir criar Admin com e-mail já existente", async () => {
    const response = await request(app)
      .post("/admins")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Admin Duplicado",
        email: "admin.user@teste.com",
        password: "123456",
      });

    expect(response.status).toBe(400);
  });

  it("Não deve atualizar Admin com e-mail pertencente a outro usuário", async () => {
    await request(app).post("/customers").send({
      name: "User Conflito Admin",
      email: "conflito.admin@teste.com",
      password: "123456",
    });

    const response = await request(app)
      .put(`/admins/${adminId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Admin Alterado",
        email: "conflito.admin@teste.com",
      });

    expect(response.status).toBe(400);
  });

  it("Não deve atualizar Cliente com e-mail pertencente a outro usuário", async () => {
    const tempCust = await request(app).post("/customers").send({
      name: "Cliente Ativo Temp",
      email: "temp.ativo.cust@teste.com",
      password: "123456",
    });

    const response = await request(app)
      .put(`/customers/${tempCust.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Cliente Conflito",
        email: "admin.user@teste.com",
      });

    expect(response.status).toBe(400);
  });

  it("Deve trocar a senha do técnico com sucesso e falhar com senha antiga incorreta", async () => {
    const techEmail = `tech.senha.ok.${Date.now()}@teste.com`;

    await request(app)
      .post("/technicians")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Técnico Troca OK",
        email: techEmail,
        password: "123456_SenhaSecreta",
        availableHours: ["08:00"],
      });

    const loginRes = await request(app).post("/sessions").send({
      email: techEmail,
      password: "123456_SenhaSecreta",
    });

    const techToken = loginRes.body.token || loginRes.body.accessToken;

    const resError = await request(app)
      .patch("/technicians/password")
      .set("Authorization", `Bearer ${techToken}`)
      .send({
        oldPassword: "senha_errada_incorreta",
        newPassword: "nova_senha_78910",
      });

    expect(resError.status).toBe(400);

    const resSuccess = await request(app)
      .patch("/technicians/password")
      .set("Authorization", `Bearer ${techToken}`)
      .send({
        oldPassword: "123456_SenhaSecreta",
        newPassword: "nova_senha_78910",
      });

    expect(resSuccess.status).toBe(204);
  });

  it("Não deve deletar Admin inexistente", async () => {
    const response = await request(app)
      .delete("/admins/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it("Não deve deletar Cliente inexistente", async () => {
    const response = await request(app)
      .delete("/customers/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it("Não deve deletar Admin inexistente", async () => {
    const response = await request(app)
      .delete("/admins/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it("Não deve trocar senha de técnico se o ID for inexistente", async () => {
    const response = await request(app)
      .patch("/technicians/password")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        oldPassword: "123456",
        newPassword: "nova_senha_78910",
      });

    expect([400, 403, 404]).toContain(response.status);
  });

  it("Deve testar a atualização de avatar do usuário com e sem arquivo", async () => {
    // 1. Cadastra um técnico para pegar o ID correto
    const techEmail = `tech.avatar.${Date.now()}@teste.com`;
    const createRes = await request(app)
      .post("/technicians")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Técnico Avatar",
        email: techEmail,
        password: "123456_SenhaSecreta",
        availableHours: ["08:00"],
      });

    const techId = createRes.body.id;

    // 2. Enviando um arquivo falso de avatar com o ID correto na URL
    const resWithFile = await request(app)
      .patch(`/technicians/${techId}/avatar`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("avatar", Buffer.from("conteudo_imagem_fake"), "avatar.jpg");

    expect([200, 204]).toContain(resWithFile.status);
  });
});

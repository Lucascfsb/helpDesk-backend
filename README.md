# HelpDesk Backend

API REST para gerenciamento de atendimentos de suporte técnico. O projeto
centraliza usuários, técnicos, clientes, serviços e tickets em uma aplicação
Node.js com autenticação JWT e controle de acesso por perfil.

## Funcionalidades

- Autenticação de usuários com JWT.
- Perfis de acesso:
  - `ADMIN`: administra usuários, técnicos, serviços e tickets.
  - `TECHNICIAN`: gerencia disponibilidade, senha e atendimentos atribuídos.
  - `CUSTOMER`: cria e acompanha seus tickets.
- Cadastro, listagem, atualização e exclusão de administradores e clientes.
- Cadastro e atualização de técnicos, incluindo disponibilidade e avatar.
- Catálogo de serviços com desativação lógica.
- Criação de tickets, associação de serviços e atualização de status.
- Upload e acesso a avatares pela rota `/files`.
- Validação de variáveis de ambiente com Zod.
- Testes automatizados com Jest e Supertest.

## Tecnologias

- Node.js 20+
- TypeScript
- Express 5
- PostgreSQL
- Prisma ORM
- JWT (`jsonwebtoken`)
- Zod
- Multer
- Jest e Supertest

## Pré-requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL 14 ou superior

Você também pode utilizar o `docker-compose.yml` incluído no projeto para
subir uma instância local do PostgreSQL.

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone <URL_DO_REPOSITORIO>
cd helpDesk-backend
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public"
JWT_SECRET="substitua-por-uma-chave-segura"
```

> Não versionar o arquivo `.env`. Use uma chave JWT forte fora do ambiente de
> desenvolvimento.

Gere o Prisma Client e aplique as migrações:

```bash
npx prisma generate
npx prisma migrate dev
```

Para carregar dados iniciais de desenvolvimento, execute:

```bash
npm run seed
```

O seed remove os dados existentes e cria um administrador, três técnicos e
alguns serviços de exemplo. As credenciais criadas pelo seed são destinadas
somente ao ambiente local.

## Executando a aplicação

### Desenvolvimento

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3333` quando `PORT=3333` estiver
configurado.

### Produção

```bash
npm run build
npm start
```

O build é gerado na pasta `build/`.

### Docker

Para iniciar os serviços definidos no Compose:

```bash
docker compose up --build
```

Antes de usar esse fluxo, confira e ajuste as variáveis `DATABASE_URL` e
`JWT_SECRET` para o ambiente desejado. Em produção, substitua as credenciais
de exemplo do Compose por valores seguros.

## Testes

Execute a suíte de testes:

```bash
npm test
```

Os testes utilizam as variáveis definidas em `.env.test`. Configure um banco
de dados de teste separado para evitar alterações acidentais no banco de
desenvolvimento.

## Rotas principais

Todas as rotas, exceto a autenticação e os cadastros públicos indicados,
exigem o header:

```http
Authorization: Bearer <token>
```

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/sessions` | Público | Autentica um usuário e retorna um token |
| `POST` | `/customers` | Público | Cadastra um cliente |
| `GET` | `/customers` | Admin | Lista clientes |
| `PUT` | `/customers/:id` | Próprio usuário/Admin | Atualiza um cliente |
| `PATCH` | `/customers/:id/avatar` | Próprio usuário/Admin | Atualiza o avatar |
| `POST` | `/admins` | Admin | Cadastra um administrador |
| `GET` | `/admins` | Admin | Lista administradores |
| `PUT` | `/admins/:id` | Admin | Atualiza um administrador |
| `DELETE` | `/admins/:id` | Admin | Remove um administrador |
| `POST` | `/technicians` | Admin | Cadastra um técnico |
| `GET` | `/technicians` | Público | Lista técnicos |
| `PUT` | `/technicians/:id` | Próprio usuário/Admin | Atualiza um técnico |
| `PATCH` | `/technicians/:id/availability` | Próprio usuário/Admin | Atualiza a disponibilidade |
| `PATCH` | `/technicians/:id/avatar` | Próprio usuário/Admin | Atualiza o avatar |
| `PATCH` | `/technicians/password` | Técnico | Atualiza a senha |
| `GET` | `/services` | Autenticado | Lista serviços ativos |
| `POST` | `/services` | Admin | Cadastra um serviço |
| `PUT` | `/services/:id` | Admin | Atualiza um serviço |
| `DELETE` | `/services/:id` | Admin | Desativa um serviço |
| `POST` | `/tickets` | Cliente | Cria um ticket |
| `GET` | `/tickets` | Autenticado | Lista tickets conforme o perfil |
| `POST` | `/tickets/:id/services` | Autenticado | Adiciona um serviço ao ticket |
| `PATCH` | `/tickets/:id/services` | Autenticado | Adiciona um serviço ao ticket |
| `PATCH` | `/tickets/:id/status` | Autenticado | Atualiza o status do ticket |
| `GET` | `/files/<arquivo>` | Público | Acessa arquivos enviados |

Os status disponíveis para tickets são `OPEN`, `IN_PROGRESS` e `CLOSED`.

## Estrutura do projeto

```text
.
├── prisma/
│   ├── migrations/       # Migrações do banco
│   ├── schema.prisma     # Modelo de dados
│   └── seed.ts           # Dados iniciais de desenvolvimento
├── src/
│   ├── configs/          # Autenticação e upload
│   ├── controllers/      # Entrada e resposta HTTP
│   ├── database/         # Cliente Prisma
│   ├── middlewares/      # Autenticação, autorização e erros
│   ├── routes/           # Rotas da API
│   ├── services/         # Regras de negócio
│   └── tests/             # Testes automatizados
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API em modo watch |
| `npm run build` | Compila a aplicação para `build/` |
| `npm start` | Executa o build de produção |
| `npm test` | Executa os testes |
| `npm run test:dev` | Executa os testes em modo watch |
| `npm run seed` | Recria dados iniciais de desenvolvimento |

## Licença

Este projeto está licenciado sob a licença ISC, conforme definido no
`package.json`.

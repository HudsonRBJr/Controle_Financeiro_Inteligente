/// <reference path="./types/swagger-ui-express.d.ts" />
import path from "path";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user.routes";
import recurringTransactionRoutes from "./routes/recurring-transaction.routes";
import budgetRoutes from "./routes/budget.routes";
import installmentRoutes from "./routes/installment.routes";
import authRoutes from "./routes/auth.routes";

export const app = express();

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Controle Financeiro Inteligente API",
    version: "1.0.0",
    description: "API do sistema de controle financeiro inteligente.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local de desenvolvimento",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        summary: "Autenticar usuário e gerar token JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Autenticação realizada com sucesso",
          },
          "400": {
            description: "E-mail e senha são obrigatórios",
          },
          "401": {
            description: "Credenciais inválidas",
          },
        },
      },
    },
    "/users": {
      get: {
        summary: "Listar usuários",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de usuários retornada com sucesso",
          },
          "401": {
            description: "Token ausente ou inválido",
          },
        },
      },
      post: {
        summary: "Criar usuário",
        responses: {
          "201": {
            description: "Usuário criado com sucesso",
          },
          "409": {
            description: "E-mail já cadastrado",
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Buscar usuário por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Usuário encontrado" },
          "404": { description: "Usuário não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar usuário",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Usuário atualizado com sucesso" },
          "404": { description: "Usuário não encontrado" },
          "409": { description: "E-mail já cadastrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover usuário",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Usuário removido com sucesso" },
          "404": { description: "Usuário não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/recurring-transactions": {
      get: {
        summary: "Listar transações recorrentes",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description:
              "Lista de transações recorrentes retornada com sucesso",
          },
          "401": {
            description: "Token ausente ou inválido",
          },
        },
      },
      post: {
        summary: "Criar transação recorrente",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": {
            description: "Transação recorrente criada com sucesso",
          },
          "401": {
            description: "Token ausente ou inválido",
          },
        },
      },
    },
    "/recurring-transactions/{id}": {
      get: {
        summary: "Buscar transação recorrente por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Transação recorrente encontrada" },
          "404": { description: "Transação recorrente não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar transação recorrente",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Transação recorrente atualizada com sucesso",
          },
          "404": { description: "Transação recorrente não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover transação recorrente",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Transação recorrente removida com sucesso",
          },
          "404": { description: "Transação recorrente não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/budgets": {
      get: {
        summary: "Listar orçamentos",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de orçamentos retornada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      post: {
        summary: "Criar orçamento",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Orçamento criado com sucesso" },
          "400": { description: "Dados inválidos" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/budgets/{id}": {
      get: {
        summary: "Buscar orçamento por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Orçamento encontrado" },
          "404": { description: "Orçamento não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar orçamento",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Orçamento atualizado com sucesso" },
          "404": { description: "Orçamento não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover orçamento",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Orçamento removido com sucesso" },
          "404": { description: "Orçamento não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/installments": {
      get: {
        summary: "Listar parcelas",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de parcelas retornada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      post: {
        summary: "Criar parcela",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Parcela criada com sucesso" },
          "400": { description: "Dados inválidos" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/installments/{id}": {
      get: {
        summary: "Buscar parcela por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Parcela encontrada" },
          "404": { description: "Parcela não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar parcela",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Parcela atualizada com sucesso" },
          "404": { description: "Parcela não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover parcela",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Parcela removida com sucesso" },
          "404": { description: "Parcela não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
  },
};

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/recurring-transactions", recurringTransactionRoutes);
app.use("/budgets", budgetRoutes);
app.use("/installments", installmentRoutes);

// Swagger UI em /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Documentação HTML (arquivo separado em public/documentacao.html)
app.get("/documentacao", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "documentacao.html"));
});

app.use("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/hello", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

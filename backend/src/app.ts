/// <reference path="./types/swagger-ui-express.d.ts" />
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user.routes";
import recurringTransactionRoutes from "./routes/recurring-transaction.routes";
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
  },
};

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/recurring-transactions", recurringTransactionRoutes);

// Swagger UI em /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Documentação HTML simples em /documentacao
app.get("/documentacao", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Documentação - Controle Financeiro Inteligente</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 0 16px;
          line-height: 1.6;
          background-color: #f5f7fb;
          color: #222;
        }
        h1 {
          color: #1a237e;
        }
        h2 {
          color: #283593;
          margin-top: 24px;
        }
        code {
          background: #eceff1;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.95em;
        }
        .card {
          background: #fff;
          border-radius: 8px;
          padding: 16px 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
          margin-bottom: 16px;
        }
        .tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 8px;
        }
        .tag-get {
          background: #e3f2fd;
          color: #1565c0;
        }
        .tag-post {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .tag-put {
          background: #fff3e0;
          color: #ef6c00;
        }
        .tag-delete {
          background: #ffebee;
          color: #c62828;
        }
        .path {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }
        a {
          color: #1e88e5;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>Documentação da API</h1>
      <p>
        Esta é a documentação textual da API do
        <strong>Controle Financeiro Inteligente</strong>.
      </p>

      <div class="card">
        <h2>Swagger</h2>
        <p>
          Você pode explorar e testar a API de forma interativa acessando o
          Swagger UI em:
        </p>
        <p><a href="/docs"><code>/docs</code></a></p>
      </div>

      <div class="card">
        <h2>Autenticação (JWT)</h2>

        <p>
          Para acessar os endpoints protegidos, primeiro faça login em:
        </p>
        <p>
          <span class="tag tag-post">POST</span>
          <span class="path">/auth/login</span>
        </p>
        <p>Body esperado:</p>
        <p><code>{ "email": "seu@email",
        "password": "sua_senha" }</code></p>

        <p>
          A resposta retornará um <code>token</code> JWT. Use-o no header
          <code>Authorization</code>:
        </p>
        <p><code>Authorization: Bearer &lt;seu_token&gt;</code></p>
      </div>

      <div class="card">
        <h2>Endpoints de Usuários</h2>

        <p>
          <span class="tag tag-post">POST</span>
          <span class="path">/users</span><br />
          Cria um novo usuário (não requer autenticação).
        </p>

        <p>
          <span class="tag tag-get">GET</span>
          <span class="path">/users</span><br />
          Lista todos os usuários (requer token).
        </p>

        <p>
          <span class="tag tag-get">GET</span>
          <span class="path">/users/{id}</span><br />
          Busca um usuário pelo ID (requer token).
        </p>

        <p>
          <span class="tag tag-put">PUT</span>
          <span class="path">/users/{id}</span><br />
          Atualiza os dados de um usuário (requer token).
        </p>

        <p>
          <span class="tag tag-delete">DELETE</span>
          <span class="path">/users/{id}</span><br />
          Remove um usuário (requer token).
        </p>
      </div>

      <div class="card">
        <h2>Endpoints de Transações Recorrentes</h2>

        <p>
          <span class="tag tag-get">GET</span>
          <span class="path">/recurring-transactions</span><br />
          Lista todas as transações recorrentes (requer token).
        </p>

        <p>
          <span class="tag tag-post">POST</span>
          <span class="path">/recurring-transactions</span><br />
          Cria uma nova transação recorrente (requer token).
        </p>

        <p>
          <span class="tag tag-get">GET</span>
          <span class="path">/recurring-transactions/{id}</span><br />
          Busca uma transação recorrente pelo ID (requer token).
        </p>

        <p>
          <span class="tag tag-put">PUT</span>
          <span class="path">/recurring-transactions/{id}</span><br />
          Atualiza os dados de uma transação recorrente (requer token).
        </p>

        <p>
          <span class="tag tag-delete">DELETE</span>
          <span class="path">/recurring-transactions/{id}</span><br />
          Remove uma transação recorrente (requer token).
        </p>
      </div>
    </body>
  </html>`);
});

app.use("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/hello", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

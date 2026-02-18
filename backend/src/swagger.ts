export const swaggerDocument = {
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
          "200": { description: "Autenticação realizada com sucesso" },
          "400": { description: "E-mail e senha são obrigatórios" },
          "401": { description: "Credenciais inválidas" },
        },
      },
    },
    "/users": {
      get: {
        summary: "Listar usuários",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de usuários retornada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      post: {
        summary: "Criar usuário",
        responses: {
          "201": { description: "Usuário criado com sucesso" },
          "409": { description: "E-mail já cadastrado" },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Buscar usuário por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Usuário encontrado" },
          "404": { description: "Usuário não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar usuário",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
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
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
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
          "200": { description: "Lista de transações recorrentes retornada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      post: {
        summary: "Criar transação recorrente",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Transação recorrente criada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/recurring-transactions/{id}": {
      get: {
        summary: "Buscar transação recorrente por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Transação recorrente encontrada" },
          "404": { description: "Transação recorrente não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar transação recorrente",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Transação recorrente atualizada com sucesso" },
          "404": { description: "Transação recorrente não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover transação recorrente",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Transação recorrente removida com sucesso" },
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
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Orçamento encontrado" },
          "404": { description: "Orçamento não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar orçamento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Orçamento atualizado com sucesso" },
          "404": { description: "Orçamento não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover orçamento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Orçamento removido com sucesso" },
          "404": { description: "Orçamento não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/accounts": {
      get: {
        summary: "Listar contas",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de contas retornada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      post: {
        summary: "Criar conta",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Conta criada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/accounts/{id}": {
      get: {
        summary: "Buscar conta por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Conta encontrada" },
          "404": { description: "Conta não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar conta",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Conta atualizada com sucesso" },
          "404": { description: "Conta não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover conta",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Conta removida com sucesso" },
          "404": { description: "Conta não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/credit-cards": {
      get: {
        summary: "Listar cartões de crédito",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de cartões retornada com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      post: {
        summary: "Criar cartão de crédito",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Cartão criado com sucesso" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/credit-cards/{id}": {
      get: {
        summary: "Buscar cartão de crédito por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Cartão encontrado" },
          "404": { description: "Cartão não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar cartão de crédito",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Cartão atualizado com sucesso" },
          "404": { description: "Cartão não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover cartão de crédito",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Cartão removido com sucesso" },
          "404": { description: "Cartão não encontrado" },
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
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Parcela encontrada" },
          "404": { description: "Parcela não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar parcela",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Parcela atualizada com sucesso" },
          "404": { description: "Parcela não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover parcela",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Parcela removida com sucesso" },
          "404": { description: "Parcela não encontrada" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/experiments": {
      get: {
        summary: "Listar experimentos A/B",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de experimentos" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      post: {
        summary: "Criar experimento A/B (com variantes)",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Experimento criado" },
          "401": { description: "Token ausente ou inválido" },
          "409": { description: "Slug já existe" },
        },
      },
    },
    "/experiments/{id}": {
      get: {
        summary: "Buscar experimento por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Experimento encontrado" },
          "404": { description: "Não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      put: {
        summary: "Atualizar experimento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Atualizado" },
          "404": { description: "Não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
      delete: {
        summary: "Remover experimento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "204": { description: "Removido" },
          "404": { description: "Não encontrado" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/experiments/{id}/assign": {
      post: {
        summary: "Obter ou atribuir variante do experimento para o usuário logado",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Atribuição (variante A/B)" },
          "404": { description: "Experimento não encontrado ou inativo" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/experiments/{id}/assignment": {
      get: {
        summary: "Consultar variante atribuída ao usuário no experimento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Atribuição" },
          "404": { description: "Usuário não está no experimento" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/metrics/events": {
      post: {
        summary: "Registrar evento de métrica (clique, impressão, sessão, etc.)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  eventType: {
                    type: "string",
                    enum: ["CLICK", "IMPRESSION", "SCREEN_VIEW", "SESSION_START", "SESSION_END"],
                  },
                  target: { type: "string" },
                  experimentId: { type: "string" },
                  variantId: { type: "string" },
                  metadata: { type: "object" },
                },
                required: ["eventType"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Evento registrado" },
          "400": { description: "eventType inválido" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/metrics/experiments/{id}/ctr": {
      get: {
        summary: "Taxa de cliques (CTR) por variante do experimento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "CTR por variante (clicks/impressions)" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/metrics/experiments/{id}/time-in-app": {
      get: {
        summary: "Tempo no app por variante (sessões)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Tempo médio e total por variante" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
    "/metrics/experiments/{id}/summary": {
      get: {
        summary: "Resumo de métricas do experimento (CTR + tempo no app)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Resumo por variante" },
          "401": { description: "Token ausente ou inválido" },
        },
      },
    },
  },
};

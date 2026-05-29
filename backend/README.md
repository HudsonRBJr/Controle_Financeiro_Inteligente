# Backend — Controle Financeiro Inteligente

API REST construída com **Express.js**, **Prisma ORM** e **PostgreSQL**. Responsável por toda a lógica de negócio, autenticação JWT, gestão de dados financeiros, sistema de experimentos A/B e métricas de uso.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Express.js 5.2 |
| Linguagem | TypeScript 5.9 |
| ORM | Prisma 7.4 |
| Banco de dados | PostgreSQL |
| Autenticação | JWT (jsonwebtoken 9) |
| Hash de senha | bcryptjs 3 |
| Documentação | Swagger UI Express 5 |
| Testes | Jest |

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou URL de conexão remota)

## Configuração

Crie um arquivo `.env` na raiz de `/backend`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/controle_financeiro"
JWT_SECRET="sua_chave_secreta_aqui"
```

## Instalação e execução

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npm run generate

# Rodar migrations do banco
npx prisma migrate dev

# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build
npm start
```

A API sobe na porta **3000** por padrão.  
Documentação Swagger disponível em: `http://localhost:3000/docs`

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Sobe em modo desenvolvimento com hot reload |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Executa o build compilado |
| `npm test` | Roda os testes Jest |
| `npm run test:watch` | Testes em modo watch |
| `npm run generate` | Gera o cliente Prisma |

## Estrutura de pastas

```
backend/
├── src/
│   ├── controllers/        # Handlers de cada rota (recebem req/res)
│   ├── services/           # Lógica de negócio e acesso ao banco
│   ├── routes/             # Definição das rotas Express
│   ├── interfaces/         # Tipos TypeScript (inputs, outputs)
│   ├── middlewares/        # ensure-authenticated (verificação JWT)
│   ├── prisma/             # Instância do PrismaClient
│   ├── __tests__/          # Testes Jest
│   ├── swagger.ts          # Gerador de documentação Swagger
│   ├── app.ts              # Setup do Express e registro de rotas
│   └── server.ts           # Entry point do servidor
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   └── migrations/         # Histórico de migrations
└── .env                    # Variáveis de ambiente (não commitar)
```

## Rotas da API

Todas as rotas (exceto `POST /auth/login` e `POST /users`) exigem o header:

```
Authorization: Bearer <token>
```

---

### Autenticação — `/auth`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login com email e senha. Retorna token JWT |

**Body:**
```json
{ "email": "user@email.com", "password": "senha123" }
```

---

### Usuários — `/users`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/users` | ❌ | Cria novo usuário |
| GET | `/users` | ✅ | Lista todos os usuários |
| GET | `/users/:id` | ✅ | Busca usuário por ID |
| PUT | `/users/:id` | ✅ | Atualiza usuário |
| DELETE | `/users/:id` | ✅ | Remove usuário |

---

### Transações — `/transactions`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/transactions` | Cria transação (INCOME, EXPENSE ou TRANSFER) |
| GET | `/transactions` | Lista transações do usuário autenticado |
| GET | `/transactions/:id` | Busca transação por ID |
| PUT | `/transactions/:id` | Atualiza transação |
| DELETE | `/transactions/:id` | Remove transação |

---

### Contas Bancárias — `/accounts`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/accounts` | Cria conta (checking, savings, wallet) |
| GET | `/accounts` | Lista contas do usuário |
| GET | `/accounts/:id` | Busca conta por ID |
| PUT | `/accounts/:id` | Atualiza conta |
| DELETE | `/accounts/:id` | Remove conta |

---

### Cartões de Crédito — `/credit-cards`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/credit-cards` | Cria cartão |
| GET | `/credit-cards` | Lista cartões do usuário |
| GET | `/credit-cards/:id` | Busca cartão por ID |
| PUT | `/credit-cards/:id` | Atualiza cartão |
| DELETE | `/credit-cards/:id` | Remove cartão |

---

### Categorias — `/categories`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/categories` | Cria categoria |
| GET | `/categories` | Lista categorias do usuário |
| GET | `/categories/:id` | Busca por ID |
| PUT | `/categories/:id` | Atualiza categoria |
| DELETE | `/categories/:id` | Remove categoria |

---

### Orçamentos — `/budgets`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/budgets` | Cria orçamento por categoria |
| GET | `/budgets` | Lista orçamentos |
| GET | `/budgets/:id` | Busca por ID |
| PUT | `/budgets/:id` | Atualiza orçamento |
| DELETE | `/budgets/:id` | Remove orçamento |

---

### Transações Recorrentes — `/recurring-transactions`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/recurring-transactions` | Cria recorrência (DAILY, WEEKLY, MONTHLY, YEARLY) |
| GET | `/recurring-transactions` | Lista recorrências |
| GET | `/recurring-transactions/:id` | Busca por ID |
| PUT | `/recurring-transactions/:id` | Atualiza recorrência |
| DELETE | `/recurring-transactions/:id` | Remove recorrência |

---

### Parcelas — `/installments`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/installments` | Cria parcela vinculada a uma transação |
| GET | `/installments` | Lista parcelas do usuário |
| GET | `/installments/:id` | Busca por ID |
| PUT | `/installments/:id` | Atualiza parcela (ex: marcar como paga) |
| DELETE | `/installments/:id` | Remove parcela |

---

### Experimentos A/B — `/experiments`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/experiments` | Cria experimento |
| GET | `/experiments` | Lista experimentos |
| GET | `/experiments/:id` | Busca por ID |
| PUT | `/experiments/:id` | Atualiza experimento |
| DELETE | `/experiments/:id` | Remove experimento |
| POST | `/experiments/:id/assign` | Atribui usuário a uma variante |
| GET | `/experiments/:id/assignment` | Retorna variante do usuário |

---

### Métricas — `/metrics`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/metrics/dashboard?days=N` | Painel geral de métricas (N dias) |
| POST | `/metrics/events` | Registra evento (CLICK, IMPRESSION, SCREEN_VIEW, SESSION_START, SESSION_END) |
| GET | `/metrics/experiments/:id/ctr` | CTR por variante de experimento |
| GET | `/metrics/experiments/:id/time-in-app` | Tempo médio por sessão por variante |
| GET | `/metrics/experiments/:id/summary` | Sumário consolidado do experimento |

---

### Configurações — `/configurations`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/configurations` | Retorna configuração do app |
| POST | `/configurations` | Cria configuração |
| PUT | `/configurations` | Atualiza configuração |

---

### Utilitários

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check — retorna `{ "message": "OK" }` |
| GET | `/docs` | Documentação Swagger interativa |

## Modelos do banco de dados

```
User
├── Account          (checking | savings | wallet)
├── CreditCard       (closingDay, dueDay, limit)
├── Category         (name, color, icon)
├── Transaction      (INCOME | EXPENSE | TRANSFER)
│   └── Installment  (number, total, amount, dueDate, paid)
├── Budget           (limit por categoria/mês)
├── RecurringTransaction (DAILY | WEEKLY | MONTHLY | YEARLY)
└── MetricEvent      (CLICK | IMPRESSION | SCREEN_VIEW | SESSION_START | SESSION_END)

Experiment
├── ExperimentVariant
└── UserExperimentAssignment

Configuration
```

## Autenticação

O middleware `ensureAuthenticated` valida o token JWT em todas as rotas protegidas, extrai o `userId` e injeta em `req.user` para uso nos controllers.

Fluxo:
1. Cliente envia `POST /auth/login` com credenciais
2. API retorna `{ token, user }`
3. Cliente inclui `Authorization: Bearer <token>` nas requisições seguintes

# 💰 Controle Financeiro Inteligente

Aplicativo móvel desenvolvido para auxiliar no gerenciamento de finanças pessoais de forma prática, organizada e estratégica.

O sistema permite que o usuário registre receitas e despesas, organize por categorias, acompanhe metas financeiras, controle orçamentos e visualize relatórios com gráficos comparativos mensais.

---

## 📱 Tipo de Aplicação

**Aplicativo Híbrido (Mobile)**

---

## 🚀 Tecnologias Utilizadas

### 🔹 Front-End (Mobile)

- React Native  
- Bibliotecas de componentes UI  
- Bibliotecas de gráficos  

### 🔹 Back-End

- **Node.js** + **Express** (API REST)  
- **TypeScript**  
- **Prisma** (ORM) + **PostgreSQL**  
- **JWT** (autenticação)  
- **bcryptjs** (hash de senhas)  
- **Swagger** (documentação interativa)  

### 🔹 Banco de Dados

- PostgreSQL  

### 🔹 Infraestrutura

- VPS (Hostinger)  
- Nginx  
- GitHub Actions (CI/CD)  

---

## 📁 Estrutura do Projeto

```
Controle_Fincanceiro_Inteligente/
├── backend/                 # API REST
│   ├── prisma/
│   │   └── schema.prisma    # Modelos do banco
│   ├── public/
│   │   └── documentacao.html  # Documentação HTML da API
│   ├── postman/
│   │   └── Controle_Financeiro_Inteligente.postman_collection.json  # Collection para importar no Postman
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middlewares/
│       ├── interfaces/
│       ├── types/
│       ├── swagger.ts       # Especificação OpenAPI (Swagger)
│       └── app.ts
└── README.md
```

---

## ⚙️ Como rodar o Backend

### Pré-requisitos

- Node.js (LTS)  
- PostgreSQL  
- npm ou yarn  

### Passos

1. **Clone o repositório** (se ainda não tiver):

   ```bash
   git clone <url-do-repositorio>
   cd Controle_Fincanceiro_Inteligente
   ```

2. **Entre na pasta do backend e instale as dependências:**

   ```bash
   cd backend
   npm install
   ```

3. **Configure o ambiente:**

   - Copie o arquivo de exemplo:  
     `cp .env_example .env`  
   - Edite o `.env` e preencha:
     - `DATABASE_URL`: URL de conexão do PostgreSQL (ex.: `postgresql://usuario:senha@localhost:5432/nome_do_banco`)
     - `JWT_SECRET`: chave secreta para geração dos tokens JWT (use um valor forte em produção)

4. **Crie o banco e rode as migrações:**

   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

   A API ficará disponível em **http://localhost:3000**.

### Scripts disponíveis

| Comando        | Descrição                    |
|----------------|------------------------------|
| `npm run dev`  | Sobe o servidor em modo desenvolvimento (ts-node-dev) |
| `npm run build`| Compila o TypeScript para `dist/` |
| `npm start`    | Roda o servidor em produção (`node dist/server.js`) |

---

## 📚 Documentação da API

- **Swagger (interativo):** [http://localhost:3000/docs](http://localhost:3000/docs)  
- **Documentação em HTML:** [http://localhost:3000/documentacao](http://localhost:3000/documentacao)  
- **Postman:** importe a collection em `backend/postman/Controle_Financeiro_Inteligente.postman_collection.json` para testar todos os endpoints.

### Autenticação

A maioria dos endpoints exige autenticação via **JWT**:

1. Faça login em `POST /auth/login` com `email` e `password`.  
2. Use o `token` retornado no header das requisições:  
   `Authorization: Bearer <token>`  
   (ou apenas `Authorization: <token>`).

### Principais recursos

| Recurso                   | Descrição                                      |
|---------------------------|------------------------------------------------|
| `POST /auth/login`        | Login (retorna token JWT)                      |
| `POST /users`             | Cadastro de usuário (público)                  |
| `GET/PUT/DELETE /users`   | Listar, atualizar e remover usuário (com token) |
| `/recurring-transactions`  | Transações recorrentes (CRUD, com token)       |
| `/budgets`                | Orçamentos por categoria/mês/ano (CRUD, com token) |
| `/accounts`               | Contas (corrente, poupança, carteira) (CRUD, com token) |
| `/credit-cards`           | Cartões de crédito (CRUD, com token)          |
| `/installments`           | Parcelas de transações (CRUD, com token)      |
| `/experiments`             | Experimentos A/B e atribuição de variantes (com token) |
| `/metrics/events`         | Registro de eventos (clique, impressão, sessão) |
| `/metrics/experiments/:id/ctr` | CTR por variante do experimento            |
| `/metrics/experiments/:id/time-in-app` | Tempo no app por variante           |
| `GET /health`             | Health check da API                            |
| `GET /hello`               | Exemplo simples                                |

---

## 🎯 Funcionalidades Principais

- Cadastro e autenticação de usuários (JWT)  
- Registro de receitas e despesas  
- Transações recorrentes (diária, semanal, mensal, anual)  
- Organização por categorias  
- Orçamentos por categoria, mês e ano  
- Contas (corrente, poupança, carteira)  
- Cartões de crédito (limite, fechamento, vencimento)  
- Parcelamento de transações  
- Definição de metas financeiras  
- Controle de orçamento mensal  
- Experimentos A/B (variantes e atribuição de usuários)  
- Métricas (CTR, tempo no app por variante)  
- Relatórios gráficos (previsto no app)  
- Comparativo de gastos por período (previsto no app)  

---

## 📄 Licença

ISC  

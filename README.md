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
Controle_Financeiro_Inteligente/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── backend/                              # API REST
│   ├── .env_example
│   ├── .gitignore
│   ├── jest.config.js                    # Configuração dos testes
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20260227042605_add/
│   │   │       └── migration.sql
│   │   └── schema.prisma                 # Modelos do banco
│   ├── prisma.config.ts
│   ├── public/
│   │   └── documentacao.html             # Documentação HTML da API
│   ├── postman/
│   │   └── Controle_Financeiro_Inteligente.postman_collection.json
│   ├── src/
│   │   ├── __tests__/                    # Testes automatizados
│   │   │   ├── helpers/
│   │   │   │   └── test-app.ts
│   │   │   ├── accounts.routes.test.ts
│   │   │   ├── app.test.ts
│   │   │   ├── auth.routes.test.ts
│   │   │   ├── budgets.routes.test.ts
│   │   │   ├── categories.routes.test.ts
│   │   │   ├── configurations.routes.test.ts
│   │   │   ├── credit-cards.routes.test.ts
│   │   │   ├── experiments.routes.test.ts
│   │   │   ├── installments.routes.test.ts
│   │   │   ├── metrics.routes.test.ts
│   │   │   ├── recurring-transactions.routes.test.ts
│   │   │   ├── transactions.routes.test.ts
│   │   │   └── users.routes.test.ts
│   │   ├── controllers/
│   │   │   ├── account.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── budget.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── configuration.controller.ts
│   │   │   ├── credit-card.controller.ts
│   │   │   ├── experiment.controller.ts
│   │   │   ├── installment.controller.ts
│   │   │   ├── metrics.controller.ts
│   │   │   ├── recurring-transaction.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── interfaces/
│   │   │   ├── account.ts
│   │   │   ├── auth.ts
│   │   │   ├── budget.ts
│   │   │   ├── category.ts
│   │   │   ├── configuration.ts
│   │   │   ├── credit-card.ts
│   │   │   ├── experiment.ts
│   │   │   ├── installment.ts
│   │   │   ├── recurring-transaction.ts
│   │   │   └── transaction.ts
│   │   ├── middlewares/
│   │   │   └── ensure-authenticated.ts
│   │   ├── prisma/
│   │   │   └── client.ts
│   │   ├── routes/
│   │   │   ├── account.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── budget.routes.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── configuration.routes.ts
│   │   │   ├── credit-card.routes.ts
│   │   │   ├── experiment.routes.ts
│   │   │   ├── installment.routes.ts
│   │   │   ├── metrics.routes.ts
│   │   │   ├── recurring-transaction.routes.ts
│   │   │   ├── transaction.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── services/
│   │   │   ├── account.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── budget.service.ts
│   │   │   ├── category.service.ts
│   │   │   ├── configuration.service.ts
│   │   │   ├── credit-card.service.ts
│   │   │   ├── experiment.service.ts
│   │   │   ├── installment.service.ts
│   │   │   ├── metrics.service.ts
│   │   │   ├── recurring-transaction.service.ts
│   │   │   ├── transaction.service.ts
│   │   │   └── user.service.ts
│   │   ├── types/
│   │   │   └── swagger-ui-express.d.ts
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── swagger.ts                     # Especificação OpenAPI (Swagger)
│   └── tsconfig.json
├── docs/
│   └── Trabalho-Lab-Mobile-Fukuta.pdf
├── frontend/                             # Interface web com Next.js
│   ├── .gitignore
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   └── logout/
│   │   │   │       └── route.ts
│   │   │   ├── configurations/
│   │   │   │   └── route.ts
│   │   │   └── metrics/
│   │   │       └── dashboard/
│   │   │           └── route.ts
│   │   ├── configuracoes/
│   │   │   └── page.tsx
│   │   ├── dashboard-metricas/
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── eslint.config.mjs
│   ├── middleware.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
├── mobile/                               # Aplicativo mobile
│   ├── .env
│   ├── .gitignore
│   ├── .vscode/
│   │   ├── extensions.json
│   │   └── settings.json
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   └── login.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── cartao-credito.tsx
│   │   │   ├── categorias.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── mais.tsx
│   │   │   ├── orcamento.tsx
│   │   │   ├── recorrentes.tsx
│   │   │   ├── relatorios.tsx
│   │   │   ├── sair.tsx
│   │   │   └── transacoes.tsx
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── assets/
│   │   └── images/
│   │       ├── android-icon-background.png
│   │       ├── android-icon-foreground.png
│   │       ├── android-icon-monochrome.png
│   │       ├── favicon.png
│   │       ├── icon.png
│   │       ├── partial-react-logo.png
│   │       ├── react-logo.png
│   │       ├── react-logo@2x.png
│   │       ├── react-logo@3x.png
│   │       └── splash-icon.png
│   ├── components/
│   │   ├── ui/
│   │   │   ├── collapsible.tsx
│   │   │   ├── icon-symbol.ios.tsx
│   │   │   └── icon-symbol.tsx
│   │   ├── external-link.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── hello-wave.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   ├── themed-text.tsx
│   │   └── themed-view.tsx
│   ├── constants/
│   │   └── theme.ts
│   ├── hooks/
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── budget.ts
│   │   ├── category.ts
│   │   ├── configuration.ts
│   │   ├── credit-card.ts
│   │   ├── metrics.ts
│   │   ├── recurring-transaction.ts
│   │   └── screen-metrics.ts
│   ├── scripts/
│   │   └── reset-project.js
│   ├── README.md
│   ├── app.json
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
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

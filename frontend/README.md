# Frontend — Controle Financeiro Inteligente

Painel administrativo web construído com **Next.js** e **Tailwind CSS**. Permite monitorar métricas de uso do aplicativo mobile e gerenciar as configurações do sistema.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| React | 19.2 |
| Estilo | Tailwind CSS 4 |
| Linguagem | TypeScript 5 |
| Linting | ESLint 9 |

## Pré-requisitos

- Node.js 18+
- Backend rodando (para comunicação via API)

## Configuração

O endereço do backend pode ser configurado diretamente em `app/api/*/route.ts`. Por padrão aponta para:

```
http://2.25.147.37:3000
```

Para alterar, edite a constante `BACKEND_URL` nos arquivos de rotas da API.

## Instalação e execução

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start

# Lint
npm run lint
```

O servidor sobe na porta **3002**.  
Acesse: `http://localhost:3002`

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento na porta 3002 |
| `npm run build` | Build de produção |
| `npm start` | Serve o build de produção na porta 3002 |
| `npm run lint` | Executa ESLint |

## Estrutura de pastas

```
frontend/
├── app/
│   ├── page.tsx                      # Página de login
│   ├── layout.tsx                    # Layout raiz
│   ├── globals.css                   # Estilos globais Tailwind
│   ├── middleware.ts                 # Proteção de rotas via cookie de sessão
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST — autentica e seta cookie
│   │   │   └── logout/route.ts       # POST — remove cookie de sessão
│   │   ├── configurations/route.ts   # GET/POST/PUT — configurações do app
│   │   └── metrics/
│   │       └── dashboard/route.ts    # GET — dados do painel de métricas
│   ├── configuracoes/
│   │   └── page.tsx                  # Página de configurações do sistema
│   └── dashboard-metricas/
│       └── page.tsx                  # Painel de métricas e analytics
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Páginas

### `/` — Login

Tela de autenticação com email e senha. Após o login bem-sucedido, cria um cookie de sessão (`config_session`) e redireciona para o painel de métricas.

### `/dashboard-metricas` — Painel de Métricas

Painel analítico completo com dados dos últimos N dias (configurável). Exibe:

- **Cards de resumo** — total de eventos, usuários ativos, visualizações de tela, cliques
- **Sessões** — iniciadas, encerradas e duração média
- **Linha do tempo diária** — gráfico de barras com volume de eventos por dia
- **Top telas** — ranking das telas mais acessadas
- **Top cliques** — elementos mais clicados
- **Distribuição por tipo** — breakdown de cada tipo de evento (CLICK, IMPRESSION, SCREEN_VIEW, etc.)
- **Qualidade de sessões** — taxa de sessões completadas
- **Tabela de eventos recentes** — últimos eventos registrados com metadata

### `/configuracoes` — Configurações

Interface CRUD para gerenciar a configuração global do aplicativo:

- Nome do app
- Descrição
- Versão

## Autenticação e rotas protegidas

O `middleware.ts` intercepta todas as requisições e:

- Redireciona usuários **não autenticados** para `/` (login)
- Redireciona usuários **já autenticados** que acessam `/` para `/dashboard-metricas`

A sessão é mantida via cookie `config_session` (sem biblioteca de sessão externa — validação simples de presença do cookie).

## Comunicação com o backend

As rotas de API do Next.js (`app/api/*/route.ts`) atuam como **proxy** entre o frontend e o backend Express, evitando expor o endereço do backend diretamente ao navegador e centralizando o tratamento de erros.

```
Browser → Next.js API Route → Backend Express (porta 3000)
```

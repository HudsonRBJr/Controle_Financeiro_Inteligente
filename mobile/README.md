# Mobile — Controle Financeiro Inteligente

Aplicativo mobile de controle financeiro pessoal construído com **React Native** e **Expo**. Interface principal do sistema, com gestão completa de transações, contas, cartões, orçamentos e relatórios.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.81.5 |
| Plataforma | Expo ~54.0 |
| Navegação | Expo Router 6 (file-based) |
| Tabs | React Navigation Bottom Tabs 7 |
| Ícones | Expo Vector Icons (MaterialIcons) |
| Persistência local | AsyncStorage |
| Animações | React Native Reanimated 4.1 |
| Gestos | React Native Gesture Handler 2.28 |
| Linguagem | TypeScript 5.9 |

## Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (para emulador Android) ou Xcode (iOS)
- App **Expo Go** no dispositivo físico (opcional)

## Configuração

Crie um arquivo `.env` na raiz de `/mobile`:

```env
EXPO_PUBLIC_BACKEND_URL=http://SEU_IP:3000
```

> Use o IP da máquina na rede local (não `localhost`) ao testar em dispositivo físico.

## Instalação e execução

```bash
# Instalar dependências
npm install

# Iniciar servidor Expo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm start` | Inicia o servidor Expo (abre QR code) |
| `npm run android` | Abre no emulador/dispositivo Android |
| `npm run ios` | Abre no simulador iOS |
| `npm run web` | Abre no navegador |
| `npm run lint` | Executa ESLint |

## Estrutura de pastas

```
mobile/
├── app/
│   ├── _layout.tsx              # Navigator raiz (Stack)
│   ├── index.tsx                # Redirect para login ou dashboard
│   ├── (auth)/
│   │   ├── _layout.tsx         # Stack de autenticação
│   │   └── login.tsx           # Tela de login e cadastro
│   └── (tabs)/
│       ├── _layout.tsx         # Tab navigator (bottom tabs)
│       ├── dashboard.tsx       # Dashboard principal
│       ├── transacoes.tsx      # Gestão de transações
│       ├── cartao-credito.tsx  # Cartões de crédito
│       ├── contas.tsx          # Contas bancárias
│       ├── categorias.tsx      # Categorias
│       ├── orcamento.tsx       # Orçamentos
│       ├── recorrentes.tsx     # Transações recorrentes
│       ├── parcelas.tsx        # Parcelas
│       ├── relatorios.tsx      # Relatórios e gráficos
│       ├── mais.tsx            # Menu "Mais"
│       └── sair.tsx            # Logout
├── lib/
│   ├── api.ts                  # Cliente HTTP com autenticação Bearer
│   ├── auth.ts                 # Login, cadastro e gestão de token
│   ├── transaction.ts          # CRUD de transações
│   ├── account.ts              # CRUD de contas bancárias
│   ├── category.ts             # CRUD de categorias
│   ├── credit-card.ts          # CRUD de cartões de crédito
│   ├── budget.ts               # CRUD de orçamentos
│   ├── installment.ts          # Leitura e atualização de parcelas
│   ├── recurring-transaction.ts # CRUD de recorrentes
│   ├── configuration.ts        # Configuração do app
│   ├── metrics.ts              # Tracking de eventos e experimentos A/B
│   └── screen-metrics.ts       # Hook de rastreamento automático de telas
├── components/                  # Componentes reutilizáveis
├── hooks/                       # Hooks customizados
├── constants/                   # Temas e cores
├── assets/                      # Imagens e ícones
└── .env                         # Variáveis de ambiente
```

## Telas

### Autenticação

| Tela | Rota | Descrição |
|---|---|---|
| Login / Cadastro | `/(auth)/login` | Formulário com alternância entre login e criação de conta |

### Navegação principal (bottom tabs)

| Tela | Rota | Descrição |
|---|---|---|
| Dashboard | `/(tabs)/dashboard` | Visão geral financeira com gráficos |
| Transações | `/(tabs)/transacoes` | Listagem, busca, filtro e CRUD completo |
| Cartões | `/(tabs)/cartao-credito` | Gestão de cartões de crédito |
| Mais | `/(tabs)/mais` | Menu com acesso a todas as demais telas |

### Telas acessadas via menu "Mais"

| Tela | Rota | Descrição |
|---|---|---|
| Orçamento | `/(tabs)/orcamento` | Acompanhamento de gastos por categoria |
| Contas | `/(tabs)/contas` | Contas bancárias (corrente, poupança, carteira) |
| Parcelas | `/(tabs)/parcelas` | Parcelas pendentes e pagas |
| Recorrentes | `/(tabs)/recorrentes` | Despesas e receitas fixas |
| Relatórios | `/(tabs)/relatorios` | Gráficos e análises financeiras |
| Categorias | `/(tabs)/categorias` | Gerenciar categorias de transações |

---

## Dashboard

O dashboard é a tela principal do app. Apresenta:

- **Hero card** com saldo total, barra comparativa receitas/despesas e total de transações
- **Taxa de Economia** com barra de progresso e status (Excelente / Muito bom / Bom / Atenção / Déficit)
- **Acesso rápido às contas** com saldo total
- **Gráfico de tendência mensal** — barras verticais agrupadas dos últimos 6 meses
- **Despesas por categoria** — barra segmentada colorida + lista com mini barras de progresso e percentuais
- **Receitas vs Despesas** — gráfico de barras comparativo com valor do saldo central
- **Transações recentes** — últimas 6 transações com exclusão inline

Suporta **pull-to-refresh** e integra dados de contas bancárias quando cadastradas.

---

## Fluxo de autenticação

```
1. Usuário abre o app
2. index.tsx verifica token no AsyncStorage
3. Sem token → redireciona para /(auth)/login
4. Com token → redireciona para /(tabs)/dashboard
5. Login bem-sucedido → token salvo no AsyncStorage
6. Toda requisição autenticada inclui: Authorization: Bearer <token>
7. Logout → token removido e redirecionamento para login
```

## Padrão de modais

Todas as telas com CRUD (transações, contas, cartões, categorias, orçamentos, recorrentes) seguem o mesmo padrão de Modal:

```tsx
<Modal visible={visible} transparent animationType="slide">
  <Pressable style={overlay} onPress={fecharModal}>
    <Pressable style={conteudo} onPress={e => e.stopPropagation()}>
      {/* Formulário */}
    </Pressable>
  </Pressable>
</Modal>
```

- Animação `slide` para formulários (bottom sheet)
- Animação `fade` para confirmações de exclusão
- Toque fora do modal fecha automaticamente

## Métricas e telemetria

O app rastreia automaticamente o comportamento do usuário e envia eventos para o backend:

| Hook / Função | Uso |
|---|---|
| `useScreenMetrics(nome)` | Registra `SCREEN_VIEW` ao entrar na tela e `SESSION` ao sair |
| `trackClick(alvo, metadata?)` | Registra evento `CLICK` com alvo e metadados opcionais |
| `recordMetricEvent(evento)` | Registra qualquer tipo de evento manualmente |

Esses dados alimentam o painel de métricas do frontend administrativo.

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `EXPO_PUBLIC_BACKEND_URL` | URL base da API backend | `http://192.168.1.100:3000` |

> Variáveis com prefixo `EXPO_PUBLIC_` são expostas ao bundle do cliente.

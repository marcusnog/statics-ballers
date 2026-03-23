# Estrutura do Projeto — Estatics Ballers

Sistema de automação de estatísticas de apostas em futebol: coleta de jogos, cálculo de métricas e geração de relatórios via LLM.

---

## Visão geral da arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FONTES DE DADOS                               │
│  football-data.org  │  SofaScore (ScraperFC)  │  FlashScore (fork)   │
└──────────────┬──────┴──────────────┬──────────┴──────────┬───────────┘
               │                     │                     │
               ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      COLETORES (collectors/)                          │
│  football_data.py │ sofascore.py │ flashscore.py │ odds_api.py       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  main.py  →  merge / deduplicação  →  storage  →  metrics  →  LLM    │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  data/  (matches, fixtures, metrics)  │  reports/  (relatórios .md)   │
└──────────────────────────────────────┴───────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│               FRONTEND Next.js (app/, components/, lib/)              │
│                    API Routes  →  React Components                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de diretórios e arquivos

```
estatics-ballers/
│
├── 📄 main.py                 # Orquestrador: coleta, merge, métricas, relatório
├── 📄 config.py               # Configuração (env, competições, fontes)
├── 📄 storage.py              # Persistência (matches, janela móvel, merge multi-fonte)
├── 📄 metrics.py              # Cálculo de métricas (over/under, ambas marcam, etc.)
├── 📄 llm_report.py           # Geração de relatório em Markdown via OpenAI/Anthropic/Groq
├── 📄 notify.py               # Notificações via Telegram (opcional)
├── 📄 run_scheduler.py        # Agendador: 06:00 coleta | 08/12/16/20h fixtures
├── 📄 run_daily.bat           # Script Windows para execução manual
│
├── collectors/                # Coletores de dados externos
│   ├── __init__.py
│   ├── football_data.py       # API football-data.org (resultados, fixtures)
│   ├── sofascore.py           # SofaScore via ScraperFC (fonte primária)
│   ├── api_football.py        # API-Football (api-sports.io) - 100 req/dia
│   ├── api_futebol_br.py      # API-Futebol BR (competições brasileiras)
│   ├── flashscore.py          # FlashScore via fs-football-fork (opcional)
│   └── odds_api.py            # The Odds API (cotações)
│
├── data/                      # Dados gerados pelo backend
│   ├── matches.json           # Histórico de partidas (janela configurável)
│   ├── fixtures.json          # Próximos jogos (para "Jogos do dia")
│   ├── metrics.json           # Métricas calculadas
│   ├── fixtures_seed.json     # Fixtures de exemplo (fallback)
│   └── seed.json              # Seed para métricas (fallback sem API)
│
├── reports/                   # Relatórios em Markdown
│   └── relatorio_YYYY-MM-DD.md
│
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Layout principal
│   ├── page.tsx               # Página inicial (dashboard)
│   ├── globals.css            # Estilos globais
│   │
│   └── api/                   # API Routes (backend Next.js)
│       ├── metrics/route.ts   # GET /api/metrics
│       ├── matches/route.ts   # GET /api/matches
│       ├── fixtures/route.ts  # GET /api/fixtures
│       ├── reports/route.ts   # GET /api/reports
│       └── reports/latest/route.ts  # GET /api/reports/latest
│
├── components/                # Componentes React
│   ├── Header.tsx             # Cabeçalho
│   ├── Footer.tsx             # Rodapé
│   ├── DashboardSkeleton.tsx  # Skeleton de carregamento
│   ├── OverviewCards.tsx      # Cards de resumo (total jogos, over 2.5, etc.)
│   ├── LeagueComparison.tsx   # Comparativo por competição
│   ├── RecentMatches.tsx      # Últimos jogos
│   ├── TodaysGames.tsx        # Jogos do dia + sugestões
│   ├── MarketAssertiveness.tsx# Assertividade por mercado
│   ├── Recommendations.tsx    # Recomendações de apostas
│   ├── ReportViewer.tsx       # Visualizador de relatório LLM
│   └── LegalNotice.tsx        # Aviso legal
│
├── lib/                       # Utilitários frontend
│   ├── metrics.ts             # Fallback de métricas (cálculo em tempo real)
│   ├── leagues.ts             # Mapeamento de ligas/nomes
│   └── data-url.ts            # URL base para dados estáticos
│
├── public/                    # Assets estáticos
│   └── data/                  # Cópias para build estático (GitHub Pages)
│       ├── fixtures.json
│       ├── metrics.json
│       └── reports.json
│
├── scripts/
│   └── prepare-static.js      # Preparação para deploy estático
│
├── .github/
│   └── workflows/
│       └── deploy-gh-pages.yml  # CI/CD para GitHub Pages
│
├── .env                       # Variáveis de ambiente (não versionado)
├── .env.example               # Exemplo de configuração
├── requirements.txt           # Dependências Python
├── package.json               # Dependências Node
├── next.config.js             # Config Next.js
├── tailwind.config.ts         # Tailwind CSS
├── tsconfig.json
├── postcss.config.mjs
│
├── README.md                  # Documentação principal
└── ESTRUTURA.md               # Este arquivo
```

---

## Fluxo de dados

| Etapa | Descrição |
|-------|-----------|
| 1. Coleta | `main.py` chama `fetch_matches` e `fetch_fixtures` de cada coletor habilitado |
| 2. Merge | `storage.merge_from_multiple_sources()` combina fontes com deduplicação por `(home_team, away_team, date)` |
| 3. Prioridade | Em duplicatas: SofaScore > football-data > FlashScore |
| 4. Armazenamento | `storage.save_matches()` grava em `data/matches.json` |
| 5. Fixtures | Próximos jogos salvos em `data/fixtures.json` (exclui FINISHED) |
| 6. Métricas | `metrics.calculate_metrics()` processa janela móvel |
| 7. Relatório | `llm_report.generate_report()` gera Markdown |
| 8. Frontend | API Routes servem JSON; componentes React consomem |

---

## Formato interno de partida

Todos os coletores normalizam para:

```json
{
  "id": "ss_12345",
  "home_team": "Flamengo",
  "away_team": "Corinthians",
  "home_team_id": 1783,
  "away_team_id": 1779,
  "home_team_crest": "https://...",
  "away_team_crest": "https://...",
  "competition": "Brasileirão",
  "competition_code": "BSA",
  "date": "2026-03-24T19:00:00Z",
  "home_goals": 2,
  "away_goals": 1,
  "status": "FINISHED",
  "total_goals": 3
}
```

---

## Variáveis de ambiente (.env)

| Variável | Descrição |
|----------|-----------|
| `FOOTBALL_DATA_API_KEY` | API football-data.org |
| `THE_ODDS_API_KEY` | API the-odds-api.com |
| `OPENAI_API_KEY` | OpenAI (relatório) |
| `ANTHROPIC_API_KEY` | Anthropic (relatório) |
| `GROQ_API_KEY` | Groq (relatório) |
| `LLM_PROVIDER` | `openai` / `anthropic` / `groq` |
| `TELEGRAM_BOT_TOKEN` | Bot Telegram (opcional) |
| `TELEGRAM_CHAT_ID` | Chat Telegram (opcional) |
| `API_FOOTBALL_KEY` | API api-sports.io |
| `API_FOOTBALL_ENABLED` | `true` / `false` |
| `API_FUTEBOL_BR_KEY` | API api-futebol.com.br |
| `API_FUTEBOL_BR_ENABLED` | `true` / `false` |
| `SOFASCORE_ENABLED` | `true` / `false` |
| `FLASHSCORE_ENABLED` | `true` / `false` |
| `FIXTURE_WINDOW_DAYS` | Próximos N dias (default 7) |

---

## Dependências principais

**Python:** `requests`, `python-dotenv`, `openai`, `anthropic`, `schedule`, `ScraperFC`, `fs-football-fork`, `httpx`  

**Node:** Next.js, React, Tailwind CSS

---

## Comandos CLI

| Comando | Descrição |
|---------|-----------|
| `python main.py` | Coleta completa + métricas + relatório |
| `python main.py --fixtures-only` | Atualiza apenas fixtures (próximos jogos) |
| `python main.py --schedule` | Inicia agendador em loop |
| `python run_scheduler.py` | Inicia agendador (equivalente a `--schedule`) |

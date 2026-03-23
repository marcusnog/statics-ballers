# Estatics Ballers — Sistema de Automação de Estatísticas de Apostas

Sistema que coleta resultados de futebol, calcula métricas (janela móvel de 30 dias) e gera relatórios diários em Markdown via LLM.

## Arquitetura

```
[Agendador — 06:00 coleta | 08/12/16/20h fixtures]
         ↓
[main.py]
   ├── Coleta via football-data.org + the-odds-api
   ├── Armazena/atualiza janela de 30 dias
   ├── Calcula métricas
   └── Chama OpenAI ou Anthropic para gerar relatório
         ↓
[Saída: reports/relatorio_YYYY-MM-DD.md + Telegram opcional]
```

## Instalação

```bash
cd estatics-ballers
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

## Configuração

1. Copie `.env.example` para `.env`
2. Obtenha as chaves:
   - **football-data.org**: [Registro gratuito](https://www.football-data.org/register) — 10 req/min
   - **the-odds-api.com**: [Registro gratuito](https://the-odds-api.com/) — 500 req/mês
   - **OpenAI** ou **Anthropic**: para geração do relatório via LLM
3. Preencha no `.env`:

```env
FOOTBALL_DATA_API_KEY=sua_chave
THE_ODDS_API_KEY=sua_chave
OPENAI_API_KEY=sua_chave
# OU ANTHROPIC_API_KEY=...
LLM_PROVIDER=openai

# Opcional: Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Uso

### Execução manual (uma vez)

```bash
python main.py
```

### Atualizar apenas fixtures (próximos jogos)

```bash
python main.py --fixtures-only
```

Útil para manter os dados de jogos do dia atualizados sem rodar coleta completa.

### Agendador em loop

```bash
python run_scheduler.py
```

- **Coleta completa:** 06:00 (matches, métricas, relatório)
- **Fixtures:** 08h, 12h, 16h, 20h (atualiza próximos jogos)

### Cron / Windows Task Scheduler

**Coleta completa (1x/dia às 06:00):**
```cmd
schtasks /create /tn "EstaticsBallers" /tr "python C:\caminho\estatics-ballers\main.py" /sc daily /st 06:00
```

**Fixtures (a cada 4h para dados mais assertivos):**
```cmd
schtasks /create /tn "EstaticsBallersFixtures" /tr "python C:\caminho\estatics-ballers\main.py --fixtures-only" /sc hourly /ri 4
```

Ou no cron (Linux): `0 8,12,16,20 * * * cd /path/project && python main.py --fixtures-only`

## Frontend Next.js

O projeto inclui um frontend React/Next.js que exibe as estatísticas.

### Instalação e execução

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

O frontend lê os dados via API Routes (arquivos em `data/` e `reports/`). Execute `python main.py` antes para gerar `data/metrics.json` e os relatórios. Sem isso, a API usa `data/seed.json` e calcula métricas em tempo real.

## Estrutura do Projeto

```
estatics-ballers/
├── app/                 # Next.js App Router
│   ├── api/             # API Routes (metrics, matches, reports)
│   ├── layout.tsx
│   └── page.tsx
├── components/          # Componentes React
├── lib/                 # Utilitários (metrics fallback)
├── main.py              # Orquestração Python
├── config.py            # Variáveis de ambiente
├── storage.py           # Persistência (janela 30 dias)
├── metrics.py           # Cálculo de métricas
├── llm_report.py        # Geração via OpenAI/Anthropic
├── notify.py            # Telegram opcional
├── collectors/
├── data/                # matches.json, metrics.json, seed.json
├── reports/             # relatorio_YYYY-MM-DD.md
├── package.json
├── requirements.txt
└── README.md
```

## APIs e Limites

| API               | Plano gratuito  | Dados                    |
|-------------------|-----------------|--------------------------|
| football-data.org | 10 req/min      | Resultados, fixtures     |
| the-odds-api.com  | 500 req/mês     | Odds em tempo real       |

Sem `FOOTBALL_DATA_API_KEY`, o sistema usa apenas dados já armazenados em `data/matches.json`.  
Sem `OPENAI_API_KEY` nem `ANTHROPIC_API_KEY`, gera um relatório básico em Markdown.

## Publicar no GitHub Pages

Repositório: [marcusnog/statics-ballers](https://github.com/marcusnog/statics-ballers)

1. **Conecte e envie o código**:
   ```bash
   git remote add origin https://github.com/marcusnog/statics-ballers.git
   git branch -M main
   git push -u origin main
   ```

2. **Configure o repositório** no GitHub:
   - Settings → Pages → Source: **GitHub Actions**

3. **Faça push** para a branch `main`. O workflow `.github/workflows/deploy-gh-pages.yml` vai:
   - Rodar `python main.py` (com secrets opcionais para APIs)
   - Gerar dados estáticos
   - Fazer build do Next.js
   - Publicar em `https://marcusnog.github.io/statics-ballers/`

4. **Secrets opcionais** (para dados reais no deploy):
   - `FOOTBALL_DATA_API_KEY` — football-data.org
   - `GROQ_API_KEY` — LLM para relatório

5. **Build local** (testar antes do push):
   ```bash
   python main.py
   npm run build:gh-pages
   # Saída em out/
   ```

## Aviso Legal

As estatísticas são tendências históricas. Apostas esportivas envolvem risco financeiro. Passado não garante resultados futuros. Jogue com responsabilidade.

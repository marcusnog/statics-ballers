"""Configuração central do sistema."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# APIs
FOOTBALL_DATA_API_KEY = os.getenv("FOOTBALL_DATA_API_KEY", "")
THE_ODDS_API_KEY = os.getenv("THE_ODDS_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()

# Telegram
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# Paths
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", str(BASE_DIR / "reports")))
DATA_DIR = BASE_DIR / "data"

# Competições monitoradas (football-data.org codes)
# Limite free tier: 12 competições
FOOTBALL_DATA_COMPETITIONS = [
    "PL",   # Premier League (England)
    "PD",   # La Liga (Spain)
    "BL1",  # Bundesliga (Germany)
    "SA",   # Serie A (Italy)
    "FL1",  # Ligue 1 (France)
    "CL",   # Champions League
    "EL",   # Europa League
    "DED",  # Eredivisie (Netherlands)
    "PPL",  # Primeira Liga (Portugal)
    "ELC",  # Championship (England)
    "BSA",  # Brasileirão Série A (Brazil)
    "CLI",  # Copa Libertadores (South America)
]

# Mapeamento para exibição
COMPETITION_NAMES = {
    "PL": "Premier League",
    "PD": "La Liga",
    "BL1": "Bundesliga",
    "SA": "Serie A",
    "FL1": "Ligue 1",
    "CL": "Champions League (UCL)",
    "EL": "Europa League",
    "DED": "Eredivisie",
    "PPL": "Primeira Liga",
    "ELC": "Championship",
    "BSA": "Brasileirão",
    "CLI": "Libertadores",
}

# The Odds API - sport keys para futebol (ordem alinhada às competições)
ODDS_SPORTS = [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_germany_bundesliga",
    "soccer_italy_serie_a",
    "soccer_france_ligue_one",
    "soccer_uefa_champs_league",
    "soccer_uefa_europa_league",
    "soccer_netherlands_eredivisie",
    "soccer_portugal_primeira_liga",
    "soccer_efl_champ",
    "soccer_brazil_campeonato",
    "soccer_conmebol_libertadores",
]

# Janela de dados em dias (2 meses para maior credibilidade)
METRICS_WINDOW_DAYS = 60

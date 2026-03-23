"""Coletor de odds do the-odds-api.com."""
from datetime import datetime
from typing import Any

import requests

from config import THE_ODDS_API_KEY, ODDS_SPORTS

BASE_URL = "https://api.the-odds-api.com/v4"


def fetch_odds(
    sport_keys: list[str] | None = None,
    regions: str = "eu",
    markets: str = "h2h,totals,btts",
) -> dict[str, Any]:
    """
    Busca odds atuais.
    Free tier: 500 req/mês. Cada sport conta como 1 request.
    """
    if not THE_ODDS_API_KEY:
        return {"events": [], "usage": {}}

    sports = sport_keys or ODDS_SPORTS
    all_events = []
    usage = {}

    for sport in sports:
        try:
            url = f"{BASE_URL}/sports/{sport}/odds"
            params = {
                "apiKey": THE_ODDS_API_KEY,
                "regions": regions,
                "markets": markets,
            }
            resp = requests.get(url, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()

            for event in data:
                event["_sport"] = sport
                all_events.append(event)

            # Odds API retorna uso nos headers
            remaining = resp.headers.get("x-requests-remaining", "?")
            used = resp.headers.get("x-requests-used", "?")
            usage[sport] = {"remaining": remaining, "used": used}

        except requests.RequestException:
            continue

    return {"events": all_events, "usage": usage}


def fetch_scores(
    sport_keys: list[str] | None = None,
) -> list[dict[str, Any]]:
    """Busca resultados recentes (scores)."""
    if not THE_ODDS_API_KEY:
        return []

    sports = sport_keys or ODDS_SPORTS
    all_scores = []

    for sport in sports:
        try:
            url = f"{BASE_URL}/sports/{sport}/scores"
            params = {
                "apiKey": THE_ODDS_API_KEY,
                "daysFrom": 2,  # últimos 2 dias
            }
            resp = requests.get(url, params=params, timeout=15)
            resp.raise_for_status()
            events = resp.json()

            for ev in events:
                ev["_sport"] = sport
                all_scores.append(ev)

        except requests.RequestException:
            continue

    return all_scores

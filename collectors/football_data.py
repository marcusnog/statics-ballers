"""Coletor de dados do football-data.org API v4."""
import time
from datetime import datetime, timedelta
from typing import Any

import requests

from config import (
    FOOTBALL_DATA_API_KEY,
    FOOTBALL_DATA_COMPETITIONS,
    COMPETITION_NAMES,
)

BASE_URL = "https://api.football-data.org/v4"
CREST_BASE = "https://crests.football-data.org"


def _headers() -> dict:
    return {
        "X-Auth-Token": FOOTBALL_DATA_API_KEY,
        "Accept": "application/json",
    }


def fetch_matches(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """
    Busca partidas no período.
    football-data.org: 10 req/min no free tier.
    """
    if not FOOTBALL_DATA_API_KEY:
        return []

    all_matches = []
    date_from_str = date_from.strftime("%Y-%m-%d")
    date_to_str = date_to.strftime("%Y-%m-%d")

    for comp_code in FOOTBALL_DATA_COMPETITIONS:
        try:
            url = f"{BASE_URL}/competitions/{comp_code}/matches"
            params = {"dateFrom": date_from_str, "dateTo": date_to_str}
            resp = requests.get(url, headers=_headers(), params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            matches = data.get("matches", [])

            for m in matches:
                m["_competition_code"] = comp_code
                m["_competition_name"] = COMPETITION_NAMES.get(
                    comp_code, comp_code
                )
                all_matches.append(m)

            time.sleep(6)  # ~10 req/min

        except requests.RequestException as e:
            # Log silencioso - competição pode não existir no free tier
            continue

    return all_matches


SCHEDULED_STATUSES = {"SCHEDULED", "TIMED"}


def fetch_fixtures(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """Busca jogos agendados (fixtures) no período."""
    if not FOOTBALL_DATA_API_KEY:
        return []

    all_matches = []
    date_from_str = date_from.strftime("%Y-%m-%d")
    date_to_str = date_to.strftime("%Y-%m-%d")

    for comp_code in FOOTBALL_DATA_COMPETITIONS:
        try:
            url = f"{BASE_URL}/competitions/{comp_code}/matches"
            params = {"dateFrom": date_from_str, "dateTo": date_to_str}
            resp = requests.get(url, headers=_headers(), params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            matches = data.get("matches", [])

            for m in matches:
                if m.get("status") not in SCHEDULED_STATUSES:
                    continue
                m["_competition_code"] = comp_code
                m["_competition_name"] = COMPETITION_NAMES.get(
                    comp_code, comp_code
                )
                all_matches.append(m)

            time.sleep(6)

        except requests.RequestException:
            continue

    return all_matches


def normalize_match(match: dict) -> dict:
    """Converte formato da API para o formato interno."""
    score = match.get("score", {}) or {}
    full = score.get("regularTime") or score.get("fullTime") or {}
    home_goals = full.get("home") if full else None
    away_goals = full.get("away") if full else None

    utc_date = match.get("utcDate")
    dt = datetime.fromisoformat(utc_date.replace("Z", "+00:00")) if utc_date else None

    ht = match.get("homeTeam") or {}
    at = match.get("awayTeam") or {}
    home_team = ht.get("shortName") or ht.get("name", "?")
    away_team = at.get("shortName") or at.get("name", "?")
    home_id = ht.get("id")
    away_id = at.get("id")

    def crest_url(tid) -> str | None:
        return f"{CREST_BASE}/{tid}.png" if tid else None

    return {
        "id": str(match.get("id", "")),
        "home_team": home_team,
        "away_team": away_team,
        "home_team_id": home_id,
        "away_team_id": away_id,
        "home_team_crest": crest_url(home_id),
        "away_team_crest": crest_url(away_id),
        "competition": match.get("_competition_name", ""),
        "competition_code": match.get("_competition_code", ""),
        "date": dt.isoformat() if dt else None,
        "home_goals": home_goals,
        "away_goals": away_goals,
        "status": match.get("status", ""),
        "total_goals": (home_goals + away_goals) if home_goals is not None and away_goals is not None else None,
    }

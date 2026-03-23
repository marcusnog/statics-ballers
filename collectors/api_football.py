"""Coletor de dados da API-Football (api-sports.io)."""
import time
from datetime import datetime, timezone
from typing import Any

import requests

from config import API_FOOTBALL_KEY, API_FOOTBALL_ENABLED, COMPETITION_NAMES

BASE_URL = "https://v3.football.api-sports.io"

LEAGUE_IDS = {
    39: "PL",   # Premier League
    140: "PD",  # La Liga
    78: "BL1",  # Bundesliga
    135: "SA",  # Serie A
    61: "FL1",  # Ligue 1
    2: "CL",    # Champions League
    71: "BSA",  # Brasileirão Série A
    13: "LIB",  # Libertadores
    11: "SUA",  # Sul-Americana
}

STATUS_MAP = {
    "NS": "SCHEDULED",
    "1H": "LIVE",
    "HT": "LIVE",
    "2H": "LIVE",
    "ET": "LIVE",
    "P": "LIVE",
    "FT": "FINISHED",
    "AET": "FINISHED",
    "PEN": "FINISHED",
    "PST": "POSTPONED",
    "CANC": "POSTPONED",
    "ABD": "POSTPONED",
}


def _headers() -> dict[str, str]:
    """Retorna headers de autenticação."""
    return {"x-apisports-key": API_FOOTBALL_KEY}


def _request(
    endpoint: str,
    params: dict[str, Any],
    retries: int = 3,
) -> list[Any]:
    """Faz requisição com retentativas."""
    for attempt in range(retries):
        try:
            r = requests.get(
                f"{BASE_URL}{endpoint}",
                headers=_headers(),
                params=params,
                timeout=15,
            )
            r.raise_for_status()
            data = r.json()
            if data.get("errors"):
                raise ValueError(data["errors"])
            return data.get("response", [])
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(5 * (attempt + 1))
    return []


def _normalize(item: dict[str, Any]) -> dict[str, Any]:
    """Converte formato API-Football para o formato interno."""
    fix = item.get("fixture", {})
    teams = item.get("teams", {})
    goals = item.get("goals", {})
    league = item.get("league", {})

    ht = teams.get("home", {}) or {}
    at = teams.get("away", {}) or {}
    hg = goals.get("home")
    ag = goals.get("away")

    status_obj = fix.get("status", {}) or {}
    status_short = status_obj.get("short", "NS") if isinstance(status_obj, dict) else "NS"

    comp_id = league.get("id")
    comp_code = LEAGUE_IDS.get(comp_id, str(comp_id)) if comp_id else "?"
    comp_name = league.get("name") or COMPETITION_NAMES.get(comp_code, comp_code)

    date_str = fix.get("date")
    if date_str and not date_str.endswith("Z"):
        date_str = date_str.replace("+00:00", "Z") if "+00:00" in date_str else date_str + "Z"

    return {
        "id": "af_" + str(fix.get("id", "")),
        "home_team": ht.get("name") or "?",
        "away_team": at.get("name") or "?",
        "home_team_id": ht.get("id"),
        "away_team_id": at.get("id"),
        "home_team_crest": ht.get("logo"),
        "away_team_crest": at.get("logo"),
        "competition": comp_name,
        "competition_code": comp_code,
        "date": date_str,
        "home_goals": int(hg) if hg is not None else None,
        "away_goals": int(ag) if ag is not None else None,
        "status": STATUS_MAP.get(status_short, "SCHEDULED"),
        "total_goals": (int(hg) + int(ag)) if hg is not None and ag is not None else None,
    }


def fetch_matches(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """Busca partidas finalizadas no período. API usa last=30 por liga."""
    if not API_FOOTBALL_ENABLED or not API_FOOTBALL_KEY:
        return []

    current_year = datetime.now(timezone.utc).year
    results: list[dict[str, Any]] = []

    for league_id in LEAGUE_IDS:
        try:
            items = _request(
                "/fixtures",
                {"league": league_id, "season": current_year, "last": 30},
            )
            for item in items:
                n = _normalize(item)
                dt_str = n.get("date")
                if dt_str:
                    try:
                        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                        if date_from <= dt <= date_to:
                            results.append(n)
                    except (ValueError, TypeError):
                        pass
            time.sleep(1)
        except Exception as e:
            print(f"[api-football] WARN matches: league {league_id} → {e}")

    return results


def fetch_fixtures(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """Busca jogos agendados no período. API usa next=10 por liga."""
    if not API_FOOTBALL_ENABLED or not API_FOOTBALL_KEY:
        return []

    current_year = datetime.now(timezone.utc).year
    results: list[dict[str, Any]] = []

    for league_id in LEAGUE_IDS:
        try:
            items = _request(
                "/fixtures",
                {"league": league_id, "season": current_year, "next": 10},
            )
            for item in items:
                n = _normalize(item)
                if n.get("status") != "SCHEDULED":
                    continue
                dt_str = n.get("date")
                if dt_str:
                    try:
                        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                        if date_from <= dt <= date_to:
                            results.append(n)
                    except (ValueError, TypeError):
                        pass
            time.sleep(1)
        except Exception as e:
            print(f"[api-football] WARN fixtures: league {league_id} → {e}")

    return results

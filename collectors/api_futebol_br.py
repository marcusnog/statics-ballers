"""Coletor de dados da API-Futebol BR (api.api-futebol.com.br)."""
import time
from datetime import datetime, timezone, timedelta
from typing import Any

import requests

from config import API_FUTEBOL_BR_KEY, API_FUTEBOL_BR_ENABLED

BASE_URL = "https://api.api-futebol.com.br/v1"

CAMPEONATO_IDS = {
    10: "BSA",   # Brasileirão Série A
    11: "BSB",   # Brasileirão Série B
    244: "CDB",  # Copa do Brasil
    152: "CLI",  # Libertadores
    153: "SUA",  # Sul-Americana
}

STATUS_MAP = {
    "agendado": "SCHEDULED",
    "ao_vivo": "LIVE",
    "andamento": "LIVE",
    "intervalo": "LIVE",
    "encerrado": "FINISHED",
    "finalizado": "FINISHED",
    "cancelado": "POSTPONED",
    "adiado": "POSTPONED",
}


def _headers() -> dict[str, str]:
    """Retorna headers de autenticação."""
    return {"Authorization": f"Bearer {API_FUTEBOL_BR_KEY}"}


def _request(
    endpoint: str,
    retries: int = 3,
) -> dict[str, Any] | None:
    """Faz requisição GET com retentativas."""
    url = f"{BASE_URL}{endpoint}"
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=_headers(), timeout=15)
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            if attempt == retries - 1:
                raise
            time.sleep(2 * (attempt + 1))
    return None


def _parse_date_br(
    data_realizacao: str | None,
    hora_realizacao: str | None,
) -> str | None:
    """Converte data/hora BR (DD/MM/YYYY, HH:MM) para ISO 8601 UTC."""
    if not data_realizacao:
        return None
    try:
        parts = data_realizacao.strip().split("/")
        if len(parts) != 3:
            return None
        day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
        hour, minute = 0, 0
        if hora_realizacao:
            hm = hora_realizacao.strip().split(":")
            if len(hm) >= 2:
                hour, minute = int(hm[0]), int(hm[1])
        dt = datetime(year, month, day, hour, minute, tzinfo=timezone(timedelta(hours=-3)))
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    except (ValueError, IndexError):
        return None


def _normalize_partida(partida: dict[str, Any], campeonato: dict[str, Any]) -> dict[str, Any] | None:
    """Converte partida API-Futebol BR para formato interno."""
    try:
        tm = partida.get("time_mandante") or {}
        tv = partida.get("time_visitante") or {}
        cam = partida.get("campeonato") or campeonato or {}

        home_goals = partida.get("placar_mandante")
        away_goals = partida.get("placar_visitante")
        if home_goals is not None:
            try:
                home_goals = int(home_goals)
            except (TypeError, ValueError):
                home_goals = None
        if away_goals is not None:
            try:
                away_goals = int(away_goals)
            except (TypeError, ValueError):
                away_goals = None

        date_iso = partida.get("data_realizacao_iso")
        if not date_iso:
            date_iso = _parse_date_br(
                partida.get("data_realizacao"),
                partida.get("hora_realizacao"),
            )
        if date_iso and "+" in date_iso and not date_iso.endswith("Z"):
            dt = datetime.fromisoformat(date_iso.replace("Z", "+00:00"))
            date_iso = dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

        status_raw = (partida.get("status") or "agendado").lower()
        status = STATUS_MAP.get(status_raw, "SCHEDULED")

        campeonato_id = cam.get("campeonato_id")
        comp_code = CAMPEONATO_IDS.get(campeonato_id) or "?"

        return {
            "id": "br_" + str(partida.get("partida_id", "")),
            "home_team": tm.get("nome_popular") or tm.get("nome") or "?",
            "away_team": tv.get("nome_popular") or tv.get("nome") or "?",
            "home_team_id": tm.get("time_id"),
            "away_team_id": tv.get("time_id"),
            "home_team_crest": tm.get("escudo"),
            "away_team_crest": tv.get("escudo"),
            "competition": cam.get("nome") or "?",
            "competition_code": comp_code[:6] if comp_code else "?",
            "date": date_iso,
            "home_goals": home_goals,
            "away_goals": away_goals,
            "status": status,
            "total_goals": (home_goals + away_goals) if home_goals is not None and away_goals is not None else None,
        }
    except Exception:
        return None


def _fetch_rodada(campeonato_id: int, rodada: int) -> list[dict[str, Any]]:
    """Busca partidas de uma rodada específica."""
    data = _request(f"/campeonatos/{campeonato_id}/rodadas/{rodada}")
    if not data:
        return []

    partidas = data.get("partidas", [])
    campeonato = data.get("campeonato") or (partidas[0].get("campeonato") if partidas else {})

    result = []
    for p in partidas:
        n = _normalize_partida(p, campeonato)
        if n:
            result.append(n)
    return result


def _iter_rodadas(campeonato_id: int, max_rodadas: int = 50) -> list[int]:
    """Obtém lista de números de rodada a buscar (1..N ou atual ± N)."""
    data = _request(f"/campeonatos/{campeonato_id}/rodadas/atual")
    if data:
        rodada_atual = data.get("rodada") or 1
        start = max(1, rodada_atual - 15)
        end = min(max_rodadas, rodada_atual + 15)
        return list(range(start, end + 1))
    return list(range(1, min(40, max_rodadas) + 1))


def fetch_matches(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """Busca partidas no período (encerradas ou ao vivo)."""
    if not API_FUTEBOL_BR_ENABLED or not API_FUTEBOL_BR_KEY:
        return []

    results: list[dict[str, Any]] = []

    for campeonato_id in CAMPEONATO_IDS:
        try:
            rodadas = _iter_rodadas(campeonato_id)
            for rodada in rodadas:
                partidas = _fetch_rodada(campeonato_id, rodada)
                for m in partidas:
                    dt_str = m.get("date")
                    if dt_str:
                        try:
                            dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                            if date_from <= dt <= date_to and m.get("status") in ("FINISHED", "LIVE"):
                                results.append(m)
                        except (ValueError, TypeError):
                            pass
                time.sleep(0.5)
        except Exception as e:
            print(f"[api-futebol-br] WARN matches: campeonato {campeonato_id} → {e}")

    return results


def fetch_fixtures(
    date_from: datetime,
    date_to: datetime,
) -> list[dict[str, Any]]:
    """Busca jogos agendados no período."""
    if not API_FUTEBOL_BR_ENABLED or not API_FUTEBOL_BR_KEY:
        return []

    results: list[dict[str, Any]] = []

    for campeonato_id in CAMPEONATO_IDS:
        try:
            rodadas = _iter_rodadas(campeonato_id)
            for rodada in rodadas:
                partidas = _fetch_rodada(campeonato_id, rodada)
                for m in partidas:
                    if m.get("status") != "SCHEDULED":
                        continue
                    dt_str = m.get("date")
                    if dt_str:
                        try:
                            dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                            if date_from <= dt <= date_to:
                                results.append(m)
                        except (ValueError, TypeError):
                            pass
                time.sleep(0.5)
        except Exception as e:
            print(f"[api-futebol-br] WARN fixtures: campeonato {campeonato_id} → {e}")

    return results

#!/usr/bin/env python3
"""
Sistema de Atualização Diária de Estatísticas de Apostas.
Executa coleta, métricas e geração de relatório.
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from config import (
    OUTPUT_DIR,
    DATA_DIR,
    FOOTBALL_DATA_API_KEY,
    METRICS_WINDOW_DAYS,
    SOFASCORE_ENABLED,
    FLASHSCORE_ENABLED,
    API_FOOTBALL_ENABLED,
    API_FUTEBOL_BR_ENABLED,
    FIXTURE_WINDOW_DAYS,
)
from collectors.football_data import fetch_matches as fd_fetch_matches, fetch_fixtures as fd_fetch_fixtures, normalize_match
from collectors import sofascore, flashscore, api_football, api_futebol_br
from storage import load_matches, save_matches, save_fixtures, merge_from_multiple_sources
from metrics import calculate_metrics
from llm_report import generate_report
from notify import notify_report_generated

FIXTURES_SEED = DATA_DIR / "fixtures_seed.json"
FINISHED_STATUSES = {"FINISHED", "POSTPONED", "CANCELLED", "AWARDED"}


def _filter_upcoming_fixtures(fixtures: list) -> list:
    """Remove jogos encerrados ou com status final."""
    now = datetime.now(timezone.utc)
    match_duration = timedelta(hours=3)
    result = []
    for f in fixtures:
        status = (f.get("status") or "").upper()
        if status in FINISHED_STATUSES:
            continue
        date_str = f.get("date")
        if date_str:
            try:
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if dt + match_duration < now:
                    continue
            except (ValueError, TypeError):
                pass
        result.append(f)
    return result


def _save_fixtures(path: Path, fixtures: list) -> None:
    """Salva fixtures em JSON. Se vazio e existir seed, usa o seed (já filtrado)."""
    if not fixtures and FIXTURES_SEED.exists():
        try:
            with open(FIXTURES_SEED, encoding="utf-8") as f:
                data = json.load(f)
                fixtures = _filter_upcoming_fixtures(data.get("fixtures", []))
        except (json.JSONDecodeError, IOError):
            pass
    save_fixtures(path, fixtures)


def run_daily_analysis() -> Path | None:
    """Executa a análise diária completa."""
    # 1. Coletar resultados (backfill 60 dias se vazio; senão últimas 48h)
    now = datetime.now(timezone.utc)
    existing = load_matches()
    is_backfill = len(existing) == 0
    date_from = now - timedelta(days=METRICS_WINDOW_DAYS) if is_backfill else now - timedelta(days=2)
    date_to = now

    match_sources = []
    if SOFASCORE_ENABLED:
        try:
            ss_matches = sofascore.fetch_matches(date_from, date_to)
            if ss_matches:
                match_sources.append(ss_matches)
        except Exception:
            pass
    if API_FOOTBALL_ENABLED:
        try:
            af_matches = api_football.fetch_matches(date_from, date_to)
            if af_matches:
                match_sources.append(af_matches)
        except Exception:
            pass
    if FOOTBALL_DATA_API_KEY:
        raw_matches = fd_fetch_matches(date_from, date_to)
        fd_normalized = [normalize_match(m) for m in raw_matches]
        if fd_normalized:
            match_sources.append(fd_normalized)
    if API_FUTEBOL_BR_ENABLED:
        try:
            br_matches = api_futebol_br.fetch_matches(date_from, date_to)
            if br_matches:
                match_sources.append(br_matches)
        except Exception:
            pass
    if FLASHSCORE_ENABLED:
        try:
            fs_matches = flashscore.fetch_matches(date_from, date_to)
            if fs_matches:
                match_sources.append(fs_matches)
        except Exception:
            pass
    if match_sources:
        merged = merge_from_multiple_sources(match_sources, existing)
        save_matches(merged)
    else:
        print("[main] WARNING: Nenhuma fonte retornou dados; usando seed/existentes.")
        merged = load_matches()

    # 2. Fixtures (próximos N dias) — salvar para o frontend
    fixture_from = now
    fixture_to = now + timedelta(days=FIXTURE_WINDOW_DAYS)
    fixture_sources = []
    if SOFASCORE_ENABLED:
        try:
            ss_fixtures = sofascore.fetch_fixtures(fixture_from, fixture_to)
            if ss_fixtures:
                fixture_sources.append(ss_fixtures)
        except Exception:
            pass
    if API_FOOTBALL_ENABLED:
        try:
            af_fixtures = api_football.fetch_fixtures(fixture_from, fixture_to)
            if af_fixtures:
                fixture_sources.append(af_fixtures)
        except Exception:
            pass
    if FOOTBALL_DATA_API_KEY:
        fd_fixtures_raw = fd_fetch_fixtures(fixture_from, fixture_to)
        fd_fixtures_norm = [normalize_match(f) for f in fd_fixtures_raw]
        if fd_fixtures_norm:
            fixture_sources.append(fd_fixtures_norm)
    if API_FUTEBOL_BR_ENABLED:
        try:
            br_fixtures = api_futebol_br.fetch_fixtures(fixture_from, fixture_to)
            if br_fixtures:
                fixture_sources.append(br_fixtures)
        except Exception:
            pass
    if FLASHSCORE_ENABLED:
        try:
            fs_fixtures = flashscore.fetch_fixtures(fixture_from, fixture_to)
            if fs_fixtures:
                fixture_sources.append(fs_fixtures)
        except Exception:
            pass
    fixtures_normalized = merge_from_multiple_sources(fixture_sources, []) if fixture_sources else []
    fixtures_filtered = _filter_upcoming_fixtures(fixtures_normalized)

    # 2.1. Salvar fixtures em JSON para "Jogos do dia"
    fixtures_path = DATA_DIR / "fixtures.json"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _save_fixtures(fixtures_path, fixtures_filtered)

    # 3. Calcular métricas
    metrics = calculate_metrics(merged)

    # 3.1. Salvar métricas em JSON para o frontend
    metrics_path = DATA_DIR / "metrics.json"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "metrics": metrics,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    # 4. Gerar relatório via LLM
    data = {
        "metrics": metrics,
        "fixtures": fixtures_filtered,
        "raw_odds_usage": {},  # pode ser preenchido se usar odds API
    }
    report_md = generate_report(data)

    # 5. Salvar arquivo
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    report_path = OUTPUT_DIR / f"relatorio_{date_str}.md"

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md)

    # 6. Notificar (opcional)
    games_count = metrics.get("global", {}).get("total_games", 0)
    notify_report_generated(report_path, games_count)

    print(f"Relatório gerado: {report_path}")
    return report_path


def run_fixtures_only() -> int:
    """Atualiza apenas fixtures (próximos N dias). Não recalcula métricas nem relatório."""
    now = datetime.now(timezone.utc)
    fixture_from = now
    fixture_to = now + timedelta(days=FIXTURE_WINDOW_DAYS)
    fixture_sources = []
    if SOFASCORE_ENABLED:
        try:
            ss_fixtures = sofascore.fetch_fixtures(fixture_from, fixture_to)
            if ss_fixtures:
                fixture_sources.append(ss_fixtures)
        except Exception:
            pass
    if API_FOOTBALL_ENABLED:
        try:
            af_fixtures = api_football.fetch_fixtures(fixture_from, fixture_to)
            if af_fixtures:
                fixture_sources.append(af_fixtures)
        except Exception:
            pass
    if FOOTBALL_DATA_API_KEY:
        fd_fixtures_raw = fd_fetch_fixtures(fixture_from, fixture_to)
        fd_fixtures_norm = [normalize_match(f) for f in fd_fixtures_raw]
        if fd_fixtures_norm:
            fixture_sources.append(fd_fixtures_norm)
    if API_FUTEBOL_BR_ENABLED:
        try:
            br_fixtures = api_futebol_br.fetch_fixtures(fixture_from, fixture_to)
            if br_fixtures:
                fixture_sources.append(br_fixtures)
        except Exception:
            pass
    if FLASHSCORE_ENABLED:
        try:
            fs_fixtures = flashscore.fetch_fixtures(fixture_from, fixture_to)
            if fs_fixtures:
                fixture_sources.append(fs_fixtures)
        except Exception:
            pass
    fixtures_normalized = merge_from_multiple_sources(fixture_sources, []) if fixture_sources else []
    fixtures_filtered = _filter_upcoming_fixtures(fixtures_normalized)
    fixtures_path = DATA_DIR / "fixtures.json"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _save_fixtures(fixtures_path, fixtures_filtered)
    print(f"[main] Fixtures atualizados: {len(fixtures_filtered)} jogos")
    return len(fixtures_filtered)


def run_scheduler() -> None:
    """Executa o agendador: coleta completa às 06:00, fixtures às 08/12/16/20h."""
    import schedule

    schedule.every().day.at("06:00").do(run_daily_analysis)
    for hour in ("08:00", "12:00", "16:00", "20:00"):
        schedule.every().day.at(hour).do(run_fixtures_only)
    print("Agendador ativo. Coleta completa: 06:00. Fixtures: 08h, 12h, 16h, 20h.")
    while True:
        schedule.run_pending()
        import time
        time.sleep(60)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--schedule":
        run_scheduler()
    elif len(sys.argv) > 1 and sys.argv[1] == "--fixtures-only":
        run_fixtures_only()
    else:
        run_daily_analysis()

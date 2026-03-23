#!/usr/bin/env python3
"""
Sistema de Atualização Diária de Estatísticas de Apostas.
Executa coleta, métricas e geração de relatório.
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from config import OUTPUT_DIR, DATA_DIR, FOOTBALL_DATA_API_KEY, METRICS_WINDOW_DAYS
from collectors.football_data import fetch_matches, fetch_fixtures, normalize_match
from storage import load_matches, save_matches, merge_and_trim_matches
from metrics import calculate_metrics
from llm_report import generate_report
from notify import notify_report_generated

FIXTURES_SEED = DATA_DIR / "fixtures_seed.json"


def _save_fixtures(path: Path, fixtures: list) -> None:
    """Salva fixtures em JSON. Se vazio e existir seed, usa o seed."""
    if not fixtures and FIXTURES_SEED.exists():
        try:
            with open(FIXTURES_SEED, encoding="utf-8") as f:
                data = json.load(f)
                fixtures = data.get("fixtures", [])
        except (json.JSONDecodeError, IOError):
            pass
    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "fixtures": fixtures,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )


def run_daily_analysis() -> Path | None:
    """Executa a análise diária completa."""
    # 1. Coletar resultados (backfill 60 dias se vazio; senão últimas 48h)
    now = datetime.now(timezone.utc)
    existing = load_matches()
    is_backfill = len(existing) == 0
    date_from = now - timedelta(days=METRICS_WINDOW_DAYS) if is_backfill else now - timedelta(days=2)
    date_to = now

    if FOOTBALL_DATA_API_KEY:
        raw_matches = fetch_matches(date_from, date_to)
        normalized = [normalize_match(m) for m in raw_matches]
        merged = merge_and_trim_matches(existing, normalized)
        save_matches(merged)
    else:
        merged = load_matches()

    # 2. Fixtures (próximas 48h) — salvar para o frontend
    fixtures_raw = []
    fixtures_normalized = []
    if FOOTBALL_DATA_API_KEY:
        fixture_from = now
        fixture_to = now + timedelta(days=2)
        fixtures_raw = fetch_fixtures(fixture_from, fixture_to)
        fixtures_normalized = [normalize_match(f) for f in fixtures_raw]

    # 2.1. Salvar fixtures em JSON para "Jogos do dia"
    fixtures_path = DATA_DIR / "fixtures.json"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _save_fixtures(fixtures_path, fixtures_normalized)

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
        "fixtures": fixtures_normalized,
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


def run_scheduler() -> None:
    """Executa o agendador para rodar diariamente às 06:00."""
    import schedule

    schedule.every().day.at("06:00").do(run_daily_analysis)
    print("Agendador ativo. Próxima execução: 06:00")
    while True:
        schedule.run_pending()
        import time
        time.sleep(60)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--schedule":
        run_scheduler()
    else:
        run_daily_analysis()

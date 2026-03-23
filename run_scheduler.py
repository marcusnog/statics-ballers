#!/usr/bin/env python3
"""
Executa o agendador em loop (06:00 diário).
Use quando não puder usar cron/Task Scheduler.
"""
import time

import schedule

from main import run_daily_analysis


def job():
    print(f"[{time.strftime('%Y-%m-%d %H:%M')}] Executando análise...")
    run_daily_analysis()


schedule.every().day.at("06:00").do(job)
print("Agendador ativo. Próxima execução: 06:00 (ou execute main.py para rodar agora)")

while True:
    schedule.run_pending()
    time.sleep(60)

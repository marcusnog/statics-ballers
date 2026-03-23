#!/usr/bin/env python3
"""
Executa o agendador em loop.
Coleta completa: 06:00 | Fixtures: 08h, 12h, 16h, 20h
Use quando não puder usar cron/Task Scheduler.
"""
from main import run_scheduler

if __name__ == "__main__":
    run_scheduler()

@echo off
REM Agendar no Windows Task Scheduler para executar diariamente às 06:00
REM Criar tarefa: schtasks /create /tn "EstaticsBallers" /tr "%~dp0run_daily.bat" /sc daily /st 06:00

cd /d "%~dp0"
python main.py
pause

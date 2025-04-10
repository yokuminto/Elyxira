@echo off
chcp 65001 > nul


set VENV_DIR=.venv

if not exist "%VENV_DIR%\Scripts\activate" (
    echo Creating virtual environment...
    python -m venv %VENV_DIR%
)

echo Activating virtual environment...
call "%VENV_DIR%\Scripts\activate"

echo Installing dependencies...
pip install -r requirements.txt

echo Starting the application...

python tools/elyxiraOCR.py chcp 65001 > tools/log.txt 2>&1

echo Deactivating virtual environment...
deactivate

pause 
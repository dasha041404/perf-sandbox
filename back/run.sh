#!/usr/bin/env bash
# Idempotent launcher for the backend. Run from anywhere; it cd's into back/.
# Reuses existing venv and only installs/upgrades when needed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
VENV_DIR="${VENV_DIR:-.venv}"

# 1. Pick a Python interpreter (>=3.11). Search PATH and common Homebrew locations.
pick_python() {
    local candidates=(
        python3.14 python3.13 python3.12 python3.11
        /opt/homebrew/bin/python3.14 /opt/homebrew/bin/python3.13
        /opt/homebrew/bin/python3.12 /opt/homebrew/bin/python3.11
        /usr/local/bin/python3.14 /usr/local/bin/python3.13
        /usr/local/bin/python3.12 /usr/local/bin/python3.11
        /opt/homebrew/bin/python3 python3 python
    )
    for candidate in "${candidates[@]}"; do
        local bin=""
        if [ -x "$candidate" ]; then
            bin="$candidate"
        elif command -v "$candidate" >/dev/null 2>&1; then
            bin="$(command -v "$candidate")"
        else
            continue
        fi
        ver="$("$bin" -c 'import sys; print("%d.%d" % sys.version_info[:2])' 2>/dev/null || echo "")"
        case "$ver" in
            3.11|3.12|3.13|3.14|3.15)
                echo "$bin"
                return 0
                ;;
        esac
    done
    echo "ERROR: Python >=3.11 not found in PATH or in /opt/homebrew/bin, /usr/local/bin." >&2
    echo "       Install one of: 'brew install python@3.12' (macOS) or use pyenv." >&2
    return 1
}

# 2. Create venv if missing.
if [ ! -x "$VENV_DIR/bin/python" ]; then
    PY="$(pick_python)"
    echo ">>> Creating virtualenv in $VENV_DIR using $PY"
    "$PY" -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

# 3. Install/refresh deps only when pyproject.toml is newer than our stamp.
STAMP="$VENV_DIR/.install-stamp"
NEED_INSTALL=0
if [ ! -f "$STAMP" ] || [ "pyproject.toml" -nt "$STAMP" ]; then
    NEED_INSTALL=1
fi
# Also install if uvicorn isn't available yet.
if ! python -c "import uvicorn, fastapi" >/dev/null 2>&1; then
    NEED_INSTALL=1
fi

if [ "$NEED_INSTALL" -eq 1 ]; then
    echo ">>> Installing dependencies (pip install -e .[dev])"
    python -m pip install --upgrade pip
    python -m pip install -e ".[dev]"
    touch "$STAMP"
else
    echo ">>> Dependencies up to date, skipping install"
fi

# 4. Ensure data dir for default SQLite path exists (app also creates it, but be safe).
mkdir -p data

# 5. Stop any previous uvicorn bound to the same port (idempotent restart).
if command -v lsof >/dev/null 2>&1; then
    PIDS="$(lsof -ti tcp:"$PORT" -sTCP:LISTEN || true)"
    if [ -n "${PIDS:-}" ]; then
        echo ">>> Port $PORT is busy (PIDs: $PIDS) — terminating previous listeners"
        # shellcheck disable=SC2086
        kill $PIDS 2>/dev/null || true
        sleep 1
        # shellcheck disable=SC2086
        kill -9 $PIDS 2>/dev/null || true
    fi
fi

# 6. Launch.
echo ">>> Starting uvicorn on http://$HOST:$PORT (docs: /docs)"
exec uvicorn src.main:app --host "$HOST" --port "$PORT" "$@"

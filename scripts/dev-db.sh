#!/usr/bin/env bash
# Local development PostgreSQL (user-owned cluster, no sudo required).
# Usage: scripts/dev-db.sh [start|stop|status|logs]
set -euo pipefail

PGDATA="${PGDATA:-$HOME/.local/share/medibenin/pgdata}"
PGPORT="${PGPORT:-5433}"
PGLOG="${PGLOG:-$HOME/.local/share/medibenin/postgres.log}"

find_pg_ctl() {
  if command -v pg_ctl >/dev/null 2>&1; then
    command -v pg_ctl
    return
  fi
  local candidate
  candidate="$(ls -1d /usr/lib/postgresql/*/bin/pg_ctl 2>/dev/null | sort -V | tail -n 1 || true)"
  if [[ -z "$candidate" ]]; then
    echo "pg_ctl introuvable. Installez PostgreSQL (postgresql-XX)." >&2
    exit 1
  fi
  echo "$candidate"
}

PG_CTL="$(find_pg_ctl)"

case "${1:-start}" in
  start)
    if "$PG_CTL" -D "$PGDATA" status >/dev/null 2>&1; then
      echo "PostgreSQL déjà en cours d'exécution (port $PGPORT)."
    else
      "$PG_CTL" -D "$PGDATA" -l "$PGLOG" -o "-p $PGPORT -k /tmp/opencode" start
    fi
    pg_isready -h 127.0.0.1 -p "$PGPORT" || true
    ;;
  stop)
    "$PG_CTL" -D "$PGDATA" stop
    ;;
  status)
    "$PG_CTL" -D "$PGDATA" status
    pg_isready -h 127.0.0.1 -p "$PGPORT" || true
    ;;
  logs)
    tail -f "$PGLOG"
    ;;
  *)
    echo "Usage: $0 [start|stop|status|logs]" >&2
    exit 1
    ;;
esac

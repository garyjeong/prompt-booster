#!/usr/bin/env bash

set -euo pipefail

COMMAND="${1:-start}"
COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="db"

if ! command -v docker >/dev/null 2>&1; then
	echo "❌ Docker가 설치되어 있지 않습니다. Docker Desktop 또는 호환 런타임을 설치해주세요."
	exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
	echo "❌ docker compose 명령을 찾을 수 없습니다. Docker Desktop 2.20+ 또는 Compose V2 플러그인을 설치해주세요."
	exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
	echo "❌ $COMPOSE_FILE 파일을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요."
	exit 1
fi

# .env 로드 (있는 경우)
if [ -f ".env" ]; then
	set -a
	# shellcheck disable=SC1091
	. ".env"
	set +a
fi

POSTGRES_USER="${POSTGRES_USER:-promptbooster}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-promptbooster_dev}"
POSTGRES_DB="${POSTGRES_DB:-promptbooster_dev}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

wait_for_db() {
	echo "⏳ PostgreSQL 컨테이너가 준비될 때까지 대기합니다..."
	for _ in $(seq 1 30); do
		if docker compose exec -T "$SERVICE_NAME" pg_isready -U "$POSTGRES_USER" >/dev/null 2>&1; then
			echo "✅ PostgreSQL이 준비되었습니다!"
			return 0
		fi
		sleep 1
	done
	echo "⚠️  제한 시간 내에 PostgreSQL이 준비되지 않았습니다."
	return 1
}

case "$COMMAND" in
	start)
		echo "▶️ Docker PostgreSQL 컨테이너를 시작합니다..."
		POSTGRES_USER="$POSTGRES_USER" POSTGRES_PASSWORD="$POSTGRES_PASSWORD" POSTGRES_DB="$POSTGRES_DB" POSTGRES_PORT="$POSTGRES_PORT" \
			docker compose up -d "$SERVICE_NAME"
		wait_for_db
		;;
	stop)
		echo "⏹  PostgreSQL 컨테이너를 중지합니다..."
		docker compose stop "$SERVICE_NAME"
		;;
	down)
		echo "🧹 컨테이너와 볼륨을 정리합니다..."
		docker compose down
		;;
	logs)
		echo "📜 PostgreSQL 로그를 출력합니다 (Ctrl+C로 종료)..."
		docker compose logs -f "$SERVICE_NAME"
		;;
	status)
		docker compose ps "$SERVICE_NAME"
		;;
	*)
		echo "사용법: $0 [start|stop|down|logs|status]"
		exit 1
		;;
esac



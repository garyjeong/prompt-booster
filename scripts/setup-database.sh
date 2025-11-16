#!/bin/bash
# 로컬 PostgreSQL 데이터베이스 설정 스크립트

DB_NAME="promptbooster_dev"
DB_USER="promptbooster"
DB_PASSWORD="promptbooster_dev"

echo "PostgreSQL 데이터베이스 설정을 시작합니다..."

# PostgreSQL이 설치되어 있는지 확인
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL이 설치되어 있지 않습니다."
    echo "설치 방법:"
    echo "  macOS: brew install postgresql@16"
    echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  또는 https://www.postgresql.org/download/ 에서 설치"
    exit 1
fi

# PostgreSQL 서비스가 실행 중인지 확인
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL 서비스가 실행되지 않았습니다."
    echo "서비스를 시작하세요:"
    echo "  macOS: brew services start postgresql@16"
    echo "  Linux: sudo systemctl start postgresql"
    exit 1
fi

# 현재 사용자 확인
CURRENT_USER=$(whoami)

# 데이터베이스 사용자 생성 (없는 경우)
echo "데이터베이스 사용자 생성 중..."
psql -d postgres -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
psql -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# 데이터베이스 생성 (없는 경우)
echo "데이터베이스 생성 중..."
psql -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# 권한 부여
echo "권한 부여 중..."
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -d postgres -c "ALTER USER $DB_USER WITH SUPERUSER;"

# Prisma 마이그레이션 실행
echo "Prisma 마이그레이션 실행 중..."
if [ -f "prisma/schema.prisma" ]; then
    pnpm prisma migrate dev --name init || echo "⚠️  마이그레이션 실행 실패 (이미 실행되었을 수 있음)"
else
    echo "⚠️  prisma/schema.prisma 파일을 찾을 수 없습니다."
    echo "   init-db.sql을 사용하여 수동으로 테이블을 생성하세요."
    if [ -f "init-db.sql" ]; then
        psql -U $DB_USER -d $DB_NAME -f init-db.sql
    fi
fi

echo "✅ 데이터베이스 설정이 완료되었습니다!"
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"


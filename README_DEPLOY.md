# Fly.io 배포 가이드

## 사전 준비

1. Fly.io CLI 설치
```bash
curl -L https://fly.io/install.sh | sh
```

2. Fly.io 로그인
```bash
fly auth login
```

## 환경 변수 설정

Fly.io에 환경 변수를 설정합니다. 자세한 내용은 [ENV_SETUP.md](./ENV_SETUP.md)를 참조하세요.

```bash
# 필수 환경 변수
fly secrets set GEMINI_API_KEY=your_gemini_api_key
fly secrets set NEXTAUTH_SECRET=your_nextauth_secret
fly secrets set NEXTAUTH_URL=https://prompt-booster.fly.dev

# Google OAuth (선택사항)
fly secrets set GOOGLE_CLIENT_ID=your_google_client_id
fly secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**참고**: `DATABASE_URL`은 PostgreSQL 데이터베이스를 연결할 때 자동으로 설정됩니다.

## PostgreSQL 데이터베이스 설정

Fly.io에서 PostgreSQL을 생성하거나 기존 데이터베이스를 연결합니다:

```bash
# 새 PostgreSQL 앱 생성
fly postgres create --name prompt-booster-db

# 기존 앱에 연결
fly postgres attach prompt-booster-db
```

데이터베이스 URL은 자동으로 `DATABASE_URL` 환경 변수로 설정됩니다.

## 배포

```bash
# 배포 실행
fly deploy

# 배포 상태 확인
fly status

# 로그 확인
fly logs
```

## 마이그레이션 실행

`fly.toml`의 `release_command`가 설정되어 있어 배포 시 자동으로 Prisma 마이그레이션이 실행됩니다.

수동으로 실행하려면:

```bash
# SSH로 앱에 접속
fly ssh console

# 마이그레이션 실행
prisma migrate deploy
```

## 트러블슈팅

### 포트 확인
앱이 3000번 포트에서 실행되는지 확인:
```bash
fly logs | grep "Ready"
```

### 환경 변수 확인
```bash
fly secrets list
```

### 앱 재시작
```bash
fly apps restart prompt-booster
```


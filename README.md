# 🚀 Prompt Booster - 프로젝트 문서 생성 챗봇

> Gemini 2.5 Flash를 활용한 단계별 질의응답형 프로젝트 문서 생성 도구

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.10.9-teal?logo=chakraui)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5--Flash-4285f4?logo=google)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)

## 🎯 프로젝트 소개

**Prompt Booster**는 Gemini 2.5 Flash를 활용하여 단계별 질의응답을 통해 프로젝트 문서를 자동 생성하는 챗봇 서비스입니다. 기능 명세서, PRD, TRD가 혼용된 형태의 상세한 프로젝트 문서를 마크다운 형식으로 생성합니다.

### 🌟 핵심 기능

- **단계별 질의응답**: "무엇을 만들어보고 싶으신가요?"로 시작하는 자연스러운 대화
- **프로젝트 이름 추천**: Gemini가 프로젝트에 맞는 이름 3개씩 추천
- **로컬 스토리지 임시 저장**: 최종 제출 전까지 답변 수정 가능
- **계정 기반 저장**: NextAuth.js + PostgreSQL로 데이터 영구 저장
- **마크다운 프리뷰**: 생성된 문서를 미리보기 후 다운로드

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# Gemini API Key (필수)
GEMINI_API_KEY=your_gemini_api_key_here

# Database
DATABASE_URL=postgresql://promptbooster:promptbooster_dev@localhost:5432/promptbooster_dev

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (선택사항 - 문서 저장을 위해 권장)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**NEXTAUTH_SECRET 생성:**
```bash
openssl rand -base64 32
```

### 2. 데이터베이스 설정

로컬 PostgreSQL이 설치되어 있어야 합니다:

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**데이터베이스 생성:**
```bash
# 자동 설정 스크립트 실행 (권장)
./scripts/setup-database.sh

# 또는 수동 설정
psql -d postgres -c "CREATE USER promptbooster WITH PASSWORD 'promptbooster_dev';"
psql -d postgres -c "CREATE DATABASE promptbooster_dev OWNER promptbooster;"
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE promptbooster_dev TO promptbooster; ALTER USER promptbooster WITH SUPERUSER;"
psql -U promptbooster -d promptbooster_dev -f init-db.sql
```

### 3. 개발 서버 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

브라우저에서 [http://localhost:3001](http://localhost:3001) 접속

> **참고**: 개발 서버는 기본적으로 3001 포트에서 실행됩니다.

## 📋 필수 설정

### Gemini API Key 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. **Get API Key** > **Create API Key** 클릭
4. 생성된 키를 `.env.local`의 `GEMINI_API_KEY`에 추가

**API 키 확인:**
```bash
# 환경 변수 확인 스크립트 실행
./scripts/check-gemini-env.sh
```

### Google OAuth 설정 (선택사항)

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** > **사용자 인증 정보**로 이동
4. **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
5. 애플리케이션 유형: **웹 애플리케이션**
6. 승인된 리디렉션 URI 추가: `http://localhost:3001/api/auth/callback/google`
7. 생성된 클라이언트 ID와 시크릿을 `.env.local`에 추가

## 🚀 배포 (Fly.io)

### Fly.io 환경 변수 설정

```bash
# 자동 설정 스크립트 실행 (권장)
./scripts/setup-fly-env.sh your_gemini_api_key_here

# 또는 수동 설정
fly secrets set GEMINI_API_KEY=your_gemini_api_key --app prompt-booster
fly secrets set NEXTAUTH_SECRET=$(openssl rand -base64 32) --app prompt-booster
fly secrets set NEXTAUTH_URL=https://prompt-booster.fly.dev --app prompt-booster

# 앱 재시작
fly apps restart prompt-booster
```

### 배포 상태 확인

```bash
# 앱 상태 확인
fly status --app prompt-booster

# 로그 확인
fly logs --app prompt-booster

# 환경 변수 확인
fly secrets list --app prompt-booster
```

자세한 문제 해결 가이드는 [GEMINI_API_TROUBLESHOOTING.md](./GEMINI_API_TROUBLESHOOTING.md)를 참조하세요.

## 🏗️ 프로젝트 구조

```
prompt-booster/
├── scripts/                    # 유틸리티 스크립트
│   ├── setup-database.sh      # 로컬 DB 설정
│   ├── setup-fly-env.sh       # Fly.io 환경 변수 설정
│   └── check-gemini-env.sh    # Gemini API 키 확인
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth 설정
│   │   │   ├── chat/           # 다음 질문 생성 API
│   │   │   ├── chat-sessions/  # 채팅 세션 관리 API
│   │   │   ├── document/       # 문서 생성 API
│   │   │   ├── project-name/   # 프로젝트 이름 추천 API
│   │   │   └── user/           # 사용자 관리 API
│   │   ├── page.tsx            # 메인 챗봇 페이지
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChatContainer.tsx   # 채팅 컨테이너
│   │   ├── ChatHistoryList.tsx # 채팅 히스토리 목록
│   │   ├── ChatInput.tsx       # 채팅 입력
│   │   ├── ChatMessage.tsx     # 채팅 메시지
│   │   ├── DocumentPreview.tsx # 문서 프리뷰
│   │   ├── ErrorModal.tsx      # 에러 모달
│   │   ├── LoginChat.tsx       # 로그인 채팅
│   │   ├── NicknameSetup.tsx   # 닉네임 설정
│   │   ├── ProjectNameSuggestions.tsx # 프로젝트 이름 추천
│   │   ├── Sidebar.tsx         # 사이드바
│   │   └── ...
│   ├── config/
│   │   ├── constants.ts        # 상수 정의
│   │   └── env.ts              # 환경 변수 관리
│   ├── lib/
│   │   ├── gemini-client.ts    # Gemini API 클라이언트
│   │   ├── prisma.ts           # Prisma 클라이언트
│   │   ├── auth.ts             # NextAuth 설정
│   │   ├── storage.ts          # 로컬 스토리지 관리
│   │   └── errors/             # 커스텀 에러 클래스
│   ├── repositories/
│   │   ├── ChatSessionRepository.ts # 채팅 세션 저장소
│   │   ├── DocumentRepository.ts     # 문서 저장소
│   │   └── UserRepository.ts         # 사용자 저장소
│   ├── services/
│   │   ├── ChatService.ts           # 채팅 서비스
│   │   ├── ChatSessionService.ts    # 채팅 세션 서비스
│   │   ├── DocumentService.ts       # 문서 서비스
│   │   └── UserService.ts           # 사용자 서비스
│   └── types/
│       ├── api.ts              # API 타입
│       ├── chat.ts             # 챗봇 관련 타입
│       └── document.ts         # 문서 관련 타입
├── prisma/
│   ├── schema.prisma           # Prisma 스키마
│   └── migrations/             # 마이그레이션 파일
└── tests/                      # 테스트 파일
```

## 🛠️ 기술 스택

- **프레임워크**: Next.js 15.5.2 (App Router)
- **UI**: Chakra UI 2.10.9
- **인증**: NextAuth.js 4.24.13
- **데이터베이스**: PostgreSQL 16 + Prisma ORM
- **AI**: Google Gemini 2.5 Flash
- **마크다운**: react-markdown

## 📝 사용 방법

1. **로그인**: Google OAuth로 로그인 (선택사항, 문서 저장을 위해 권장)
2. **시작**: "무엇을 만들어보고 싶으신가요?" 질문에 답변
3. **단계별 질의응답**: 각 질문에 답변하며 프로젝트 정보 수집
4. **프로젝트 이름 추천**: 이름 질문 시 Gemini가 3개씩 추천
5. **채팅 히스토리**: 사이드바에서 이전 채팅 세션 확인 및 관리
6. **문서 생성**: 모든 질문 완료 후 문서 자동 생성
7. **다운로드**: 마크다운 프리뷰 확인 후 다운로드

### 주요 기능

- **Google OAuth 로그인**: Google 계정으로 간편 로그인
- **닉네임 설정**: 로그인 후 닉네임 설정 가능
- **채팅 세션 관리**: 여러 채팅 세션 생성 및 관리
- **에러 처리**: 친화적인 에러 모달 및 재시도 기능

## 🔧 개발

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 프로덕션 실행
pnpm start

# 린트
pnpm lint

# 테스트
pnpm test

# 테스트 (Watch 모드)
pnpm test:watch

# 테스트 커버리지
pnpm test:coverage
```

## 🧪 테스트

프로젝트에는 다음 테스트가 포함되어 있습니다:

- **Repository 테스트**: 데이터 접근 로직 테스트
- **Service 테스트**: 비즈니스 로직 테스트
- **API 라우트 테스트**: API 엔드포인트 테스트
- **컴포넌트 테스트**: React 컴포넌트 테스트
- **유틸리티 테스트**: 헬퍼 함수 테스트

자세한 내용은 [tests/README.md](./tests/README.md)를 참조하세요.

## 📄 라이선스

MIT

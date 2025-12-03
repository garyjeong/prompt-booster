# CONTEXT.md - Prompt Booster 프로젝트 컨텍스트

> 이 문서는 프로젝트의 구조, 아키텍처, 주요 의사결정을 문서화합니다.
> 개발자와 AI 에이전트가 프로젝트를 이해하는 데 필요한 핵심 정보를 제공합니다.

## 프로젝트 개요

**Prompt Booster**는 OpenAI GPT를 활용한 대화형 프로젝트 문서 생성 챗봇입니다. 사용자와의 단계별 질의응답을 통해 프로젝트 정보를 수집하고, PRD/TRD/기능 명세서가 혼합된 마크다운 문서를 자동 생성합니다.

## 아키텍처

### 레이어드 아키텍처

프로젝트는 명확한 레이어 분리로 구성되어 있습니다:

```
┌─────────────────────────────────────┐
│   Presentation Layer                 │
│   - React Components (Chakra UI)     │
│   - Client-side State Management     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   API Layer (Next.js Routes)        │
│   - /api/chat                       │
│   - /api/document                   │
│   - /api/chat-sessions              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Service Layer                     │
│   - ChatService                     │
│   - DocumentService                 │
│   - ChatSessionService              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Repository Layer                  │
│   - ChatSessionRepository           │
│   - DocumentRepository              │
│   - UserRepository                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Layer                        │
│   - Prisma ORM                      │
│   - PostgreSQL                      │
└─────────────────────────────────────┘
```

### 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 엔드포인트
│   ├── page.tsx           # 메인 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
├── services/              # 비즈니스 로직
├── repositories/          # 데이터 접근 계층
├── lib/                   # 유틸리티 및 헬퍼
├── types/                 # TypeScript 타입 정의
└── config/                # 설정 파일
```

## 주요 의사결정

### 1. Next.js App Router 사용

**결정**: Next.js 15.5.2의 App Router 사용

**이유**:
- 최신 Next.js 기능 활용
- 서버 컴포넌트 지원
- 향상된 성능 및 개발자 경험

**대안 고려**: Pages Router (구버전)

### 2. 레이어드 아키텍처

**결정**: Service-Repository 패턴 사용

**이유**:
- 관심사 분리
- 테스트 용이성
- 유지보수성 향상

**구조**:
- **Service**: 비즈니스 로직 처리
- **Repository**: 데이터 접근 추상화
- **API Route**: HTTP 요청/응답 처리

### 3. Prisma ORM

**결정**: Prisma를 데이터베이스 ORM으로 사용

**이유**:
- 타입 안전성
- 마이그레이션 관리 용이
- NextAuth.js와의 통합

### 4. 이중 저장 전략

**결정**: 로컬 스토리지 + 데이터베이스 이중 저장

**이유**:
- 비로그인 사용자 지원
- 오프라인 지원
- 데이터 영구 저장 (로그인 사용자)

**구현**:
- 로컬 스토리지: 모든 사용자 (임시 저장)
- 데이터베이스: 로그인 사용자 (영구 저장)

### 5. Soft Delete 패턴

**결정**: ChatSession에 `isDeleted` 플래그 사용

**이유**:
- 데이터 복구 가능
- 삭제 이력 추적
- 사용자 경험 향상 (휴지통 기능)

### 6. 에러 처리 전략

**결정**: 커스텀 에러 클래스 + 중앙화된 에러 핸들러

**구조**:
- `AppError`: 기본 에러 클래스
- `ValidationError`, `NotFoundError`, `UnauthorizedError`: 특화 에러
- `handleError()`: API 응답 변환

**이유**:
- 일관된 에러 응답 형식
- 사용자 친화적 메시지
- 개발 환경에서 상세 정보 제공

### 7. 타입 안정성

**결정**: TypeScript 엄격 모드 사용

**현재 상태**:
- TypeScript 타입 정의 완료
- 런타임 검증 부재 (개선 예정)

**개선 계획**:
- Zod 스키마 추가
- API 응답 런타임 검증

## 데이터 모델

### 핵심 엔티티

1. **User**: NextAuth.js 사용자 모델
2. **ChatSession**: 채팅 세션 (Soft Delete 지원)
3. **ChatQuestionAnswer**: 세션별 질문/답변
4. **Document**: 생성된 문서
5. **QuestionAnswer**: 문서별 질문/답변 (최종 저장)

### 관계

```
User
├── accounts (OAuth)
├── sessions (NextAuth)
├── chatSessions
└── documents
    └── questionAnswers

ChatSession
└── chatQuestionAnswers

Document
└── questionAnswers
```

## 외부 의존성

### 핵심 라이브러리

- **Next.js 15.5.2**: 프레임워크
- **React 19.1.0**: UI 라이브러리
- **Prisma 6.19.0**: ORM
- **NextAuth.js 4.24.13**: 인증
- **OpenAI SDK**: AI 통합
- **Chakra UI 2.10.9**: UI 컴포넌트

### 외부 서비스

- **OpenAI API**: GPT 모델 사용
- **PostgreSQL**: 데이터베이스
- **Google OAuth**: 인증 제공자

## 환경 변수

### 필수 변수

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `OPENAI_API_KEY`: OpenAI API 키
- `NEXTAUTH_SECRET`: NextAuth 세션 암호화 키
- `NEXTAUTH_URL`: NextAuth 콜백 URL

### 선택 변수

- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿

## 배포

### Fly.io

- **앱 이름**: `prompt-booster`
- **리전**: `iad` (US East)
- **빌드**: Dockerfile 기반
- **마이그레이션**: `prisma migrate deploy` 자동 실행

### Docker

- PostgreSQL 컨테이너 지원
- 개발 환경용 docker-compose.yml 제공

## 테스트 전략

### 현재 상태

- ✅ 단위 테스트 (Repository, Service)
- ✅ 통합 테스트 (API Routes)
- ✅ 컴포넌트 테스트
- ❌ E2E 테스트 (추가 예정)

### 테스트 도구

- **Jest**: 테스트 프레임워크
- **React Testing Library**: 컴포넌트 테스트
- **Prisma Mock**: 데이터베이스 모킹

## 개발 워크플로우

### 패키지 관리

- **pnpm**: 패키지 매니저
- **버전**: `pnpm@9.0.0`

### 코드 스타일

- **ESLint**: Next.js 기본 설정
- **TypeScript**: 엄격 모드

### Git 워크플로우

- **브랜치**: `main` (기본)
- **커밋**: Conventional Commits 권장

## 알려진 제약사항

1. **타입 안정성**: 런타임 검증 부재 (개선 예정)
2. **에러 처리**: 일부 네트워크 에러 조용히 무시 (개선 예정)
3. **테스트**: E2E 테스트 부재 (추가 예정)
4. **의존성**: 버전 범위 사용 (정확한 버전 고정 예정)

## 향후 개선 계획

1. Zod 스키마 추가로 런타임 타입 검증
2. 에러 처리 개선 (모든 에러 명시적 처리)
3. E2E 테스트 추가
4. 의존성 버전 고정
5. 환경 변수 런타임 검증 강화

## 참고 문서

- [README.md](./README.md): 사용자 가이드 및 빠른 시작
- [CLAUDE.md](./CLAUDE.md): AI 에이전트를 위한 가이드
- [tests/README.md](./tests/README.md): 테스트 가이드


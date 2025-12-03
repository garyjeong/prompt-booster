# CLAUDE.md - AI 에이전트를 위한 프로젝트 가이드

> 이 문서는 AI 에이전트(Claude 등)가 이 프로젝트에서 작업할 때 참고해야 하는 핵심 정보를 제공합니다.
> CONTEXT.md와 README.md를 먼저 읽은 후 이 문서를 참조하세요.

## 문서 계층 구조

1. **CONTEXT.md** (최우선): 프로젝트 구조, 아키텍처, 주요 의사결정
2. **README.md**: 사용자 가이드 및 빠른 시작
3. **CLAUDE.md** (현재 문서): AI 에이전트 작업 가이드

## 프로젝트 개요

**Prompt Booster**는 OpenAI GPT를 활용한 대화형 프로젝트 문서 생성 챗봇입니다.

### 핵심 기능 흐름

1. 사용자가 프로젝트 아이디어 입력
2. GPT가 단계별 질문 생성
3. 사용자가 답변
4. 충분한 정보 수집 시 문서 생성
5. 마크다운 문서 다운로드

## 아키텍처 패턴

### 레이어 분리 원칙

**절대 위반하지 말 것**:
- Service 레이어에서 직접 Prisma 호출 금지
- Repository 레이어에서 비즈니스 로직 금지
- API Route에서 직접 데이터베이스 접근 금지

**올바른 흐름**:
```
API Route → Service → Repository → Prisma
```

### 코드 위치 가이드

- **비즈니스 로직**: `src/services/`
- **데이터 접근**: `src/repositories/`
- **HTTP 처리**: `src/app/api/`
- **UI 컴포넌트**: `src/components/`
- **유틸리티**: `src/lib/`
- **타입 정의**: `src/types/`

## 코딩 규칙

### 1. 타입 안정성

- 모든 함수는 명시적 타입 정의
- `any` 타입 사용 금지
- API 응답은 타입 검증 필요 (Zod 사용 예정)

### 2. 에러 처리

**금지 패턴**:
```typescript
// ❌ 에러 조용히 무시
.catch(() => {})

// ❌ 빈 객체 반환
.catch(() => ({}))
```

**권장 패턴**:
```typescript
// ✅ 명시적 에러 처리
.catch((error) => {
  console.error('Operation failed:', error);
  // 사용자 알림 또는 적절한 폴백
})
```

### 3. 네트워크 에러

- 모든 네트워크 에러는 명시적으로 처리
- 사용자에게 친화적인 메시지 제공
- 개발 환경에서는 상세 로그 출력

### 4. 환경 변수

- 환경 변수는 `src/config/env.ts`를 통해서만 접근
- 직접 `process.env` 접근 금지
- 필수 변수는 앱 시작 시 검증 (구현 예정)

## 주요 파일 위치

### API 엔드포인트

- `/api/chat`: 다음 질문 생성
- `/api/document`: 문서 생성
- `/api/chat-sessions`: 세션 관리
- `/api/project-name`: 프로젝트 이름 추천

### 핵심 서비스

- `ChatService`: 채팅 로직
- `DocumentService`: 문서 생성 로직
- `ChatSessionService`: 세션 관리 로직

### 데이터 모델

- `prisma/schema.prisma`: 데이터베이스 스키마
- Prisma Client는 `src/lib/prisma.ts`에서 싱글톤으로 관리

## 테스트 전략

### 테스트 위치

- 단위 테스트: `tests/services/`, `tests/repositories/`
- 통합 테스트: `tests/api/`
- 컴포넌트 테스트: `tests/components/`

### 모킹 규칙

- Prisma: `@/lib/prisma` 모킹
- OpenAI: `@/lib/openai-client` 모킹
- NextAuth: `next-auth` 모킹

## 개선 작업 시 주의사항

### MCP 원칙 (Minimal Change Principle)

- 기존 API 계약 유지
- 하위 호환성 보장
- 변경 범위 최소화

### 현재 개선 중인 영역

1. **타입 안정성**: Zod 스키마 추가 예정
2. **에러 처리**: 조용히 무시되는 에러 수정 중
3. **테스트**: E2E 테스트 추가 예정

### 작업 시 체크리스트

- [ ] 기존 테스트 통과 확인
- [ ] 타입 에러 없음 확인
- [ ] ESLint 경고 없음 확인
- [ ] API 응답 형식 유지
- [ ] 하위 호환성 확인

## 자주 사용하는 패턴

### API Route 응답 형식

```typescript
// 성공
return NextResponse.json({ 
  success: true, 
  data: response 
});

// 실패
return NextResponse.json(
  { 
    success: false, 
    error: { 
      error: 'Error message',
      code: 'ERROR_CODE' 
    } 
  },
  { status: 400 }
);
```

### 에러 처리

```typescript
import { handleError } from '@/lib/middleware/error-handler';

export async function POST(request: NextRequest) {
  try {
    // 로직
  } catch (error) {
    return handleError(error);
  }
}
```

### Repository 패턴

```typescript
// Repository 인터페이스 정의
export interface IRepository {
  findById(id: string): Promise<Entity | null>;
}

// 구현
export class Repository implements IRepository {
  async findById(id: string): Promise<Entity | null> {
    return await prisma.entity.findUnique({ where: { id } });
  }
}
```

## 환경 설정

### 개발 환경

- 포트: `3001`
- 데이터베이스: Docker 컨테이너 또는 로컬 PostgreSQL
- 환경 변수: `.env` 파일

### 프로덕션 환경

- 배포: Fly.io
- 데이터베이스: Fly.io PostgreSQL 또는 외부 DB
- 환경 변수: Fly.io secrets

## 디버깅 팁

### 로그 확인

- 개발 환경: 콘솔 로그 활성화
- 프로덕션: Fly.io 로그 (`fly logs`)

### 일반적인 문제

1. **OpenAI API 에러**: API 키 확인, 환경 변수 확인
2. **데이터베이스 연결 실패**: DATABASE_URL 확인
3. **인증 실패**: NextAuth 설정 확인

## 참고 자료

- [CONTEXT.md](./CONTEXT.md): 상세 아키텍처 정보
- [README.md](./README.md): 사용자 가이드
- [Prisma 문서](https://www.prisma.io/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)

## 작업 시 우선순위

1. **안정성**: 기존 기능 깨뜨리지 않기
2. **타입 안정성**: 타입 에러 없음
3. **테스트**: 기존 테스트 통과
4. **문서화**: 변경 사항 문서화
5. **코드 품질**: ESLint 규칙 준수

## 질문이 있을 때

프로젝트를 이해하기 위해 다음 순서로 문서를 읽으세요:

1. **CONTEXT.md**: 전체 구조 이해
2. **README.md**: 사용자 관점 이해
3. **CLAUDE.md** (현재 문서): 작업 가이드
4. **관련 소스 코드**: 실제 구현 확인

특정 기능을 수정할 때는 해당 Service와 Repository 코드를 먼저 확인하세요.


# 테스트 가이드

## 테스트 구조

```
tests/
├── api/              # API 라우트 테스트
│   ├── chat.test.ts
│   └── chat-sessions.test.ts
├── components/       # 컴포넌트 테스트
│   └── ChatInput.test.tsx
├── config/          # 설정 테스트
│   └── env.test.ts
├── lib/             # 유틸리티 테스트
│   ├── storage.test.ts
│   ├── error-handler.test.ts
│   └── errors.test.ts
├── repositories/    # Repository 테스트
│   └── ChatSessionRepository.test.ts
└── services/       # Service 테스트
    ├── ChatService.test.ts
    ├── ChatSessionService.test.ts
    └── DocumentService.test.ts
```

## 테스트 실행

### 모든 테스트 실행
```bash
pnpm test
```

### Watch 모드로 실행
```bash
pnpm test:watch
```

### 커버리지 리포트 생성
```bash
pnpm test:coverage
```

### 특정 테스트 파일 실행
```bash
pnpm test tests/services/ChatService.test.ts
```

## 테스트 커버리지 목표

- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Statements**: 100%

## 테스트 작성 가이드

### Repository 테스트
- Prisma 클라이언트를 모킹하여 데이터베이스 접근을 시뮬레이션
- CRUD 작업의 정상 동작 확인
- 에러 케이스 처리 확인

### Service 테스트
- Repository를 모킹하여 비즈니스 로직만 테스트
- 외부 API 호출(OpenAI) 모킹
- 에러 처리 및 예외 상황 테스트

### API 라우트 테스트
- Next.js Request/Response 모킹
- 인증 상태 확인
- 입력 검증 및 에러 처리

### 컴포넌트 테스트
- React Testing Library 사용
- 사용자 인터랙션 시뮬레이션
- 상태 변화 확인

## 모킹 전략

### Prisma
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    chatSession: {
      findUnique: jest.fn(),
      // ...
    },
  },
}));
```

### 외부 API (OpenAI)
```typescript
jest.mock('@/lib/openai-client', () => ({
  generateNextQuestion: jest.fn(),
  suggestProjectNames: jest.fn(),
}));
```

### Next.js
- `next-auth`의 `getServerSession` 모킹
- Next.js Router 모킹 (jest.setup.js에 설정됨)

## 테스트 실행 시 주의사항

1. **환경 변수**: 테스트 환경에서는 `.env.test` 파일 사용
2. **데이터베이스**: 실제 DB 대신 Mock 사용
3. **비동기 처리**: `async/await`와 `waitFor` 적절히 사용
4. **정리 작업**: `beforeEach`, `afterEach`에서 Mock 초기화

## 예제 테스트

### Repository 테스트 예제
```typescript
describe('ChatSessionRepository', () => {
  it('ID로 세션을 조회해야 함', async () => {
    const mockSession = { /* ... */ };
    (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(mockSession);
    
    const result = await repository.findById('test-id');
    expect(result).toEqual(mockSession);
  });
});
```

### Service 테스트 예제
```typescript
describe('ChatSessionService', () => {
  it('새 세션을 생성해야 함', async () => {
    mockRepository.findBySessionId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(mockCreated);
    
    const result = await service.saveSession(session);
    expect(result.sessionId).toBe('test-session-1');
  });
});
```

## 문제 해결

### 테스트가 실행되지 않는 경우
- `jest.config.js`의 `testMatch` 패턴 확인
- 파일 확장자 확인 (`.test.ts`, `.test.tsx`)

### 모킹이 작동하지 않는 경우
- `jest.mock()` 호출이 파일 상단에 있는지 확인
- 모듈 경로가 정확한지 확인

### 타입 에러가 발생하는 경우
- `@types/jest` 설치 확인
- `tsconfig.json`의 타입 설정 확인


# E2E 테스트 가이드

## 개요

이 디렉토리에는 Playwright를 사용한 E2E(End-to-End) 테스트가 포함되어 있습니다.

## 사전 요구사항

1. **Playwright 브라우저 설치**
   ```bash
   pnpm exec playwright install chromium
   ```

2. **환경 변수 설정**
   - `OPENAI_API_KEY`: 채팅 플로우 테스트를 실행하려면 필요합니다.
   - `DATABASE_URL`: 데이터베이스 연결 테스트를 실행하려면 필요합니다.

## 테스트 실행

### 모든 E2E 테스트 실행
```bash
pnpm test:e2e
```

### UI 모드로 실행 (디버깅에 유용)
```bash
pnpm test:e2e:ui
```

### 헤드 모드로 실행 (브라우저 창 표시)
```bash
pnpm test:e2e:headed
```

### 특정 테스트 파일 실행
```bash
pnpm exec playwright test tests/e2e/homepage.spec.ts
```

## 테스트 구조

- `homepage.spec.ts`: 홈페이지 기본 기능 테스트
- `chat-flow.spec.ts`: 채팅 플로우 테스트 (OpenAI API 필요)

## 주의사항

1. **API 키 필요**: `chat-flow.spec.ts`는 실제 OpenAI API를 호출하므로 API 키가 필요합니다.
2. **서버 실행**: 테스트는 자동으로 개발 서버를 시작하지만, 수동으로 실행 중인 서버가 있으면 재사용합니다.
3. **타임아웃**: OpenAI API 응답 시간을 고려하여 타임아웃이 길게 설정되어 있습니다.

## CI/CD 통합

CI 환경에서는 다음 환경 변수를 설정하세요:

```bash
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_url
```

CI에서는 `playwright.config.ts`의 `retries` 설정에 따라 실패한 테스트가 자동으로 재시도됩니다.


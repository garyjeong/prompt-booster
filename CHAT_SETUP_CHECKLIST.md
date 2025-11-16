# 채팅 기능 설정 체크리스트

## ✅ 완료된 항목

- [x] 환경 변수 검증 로직 구현
- [x] API 에러 처리 개선
- [x] 사용자 경험 개선 (재시도 옵션 등)
- [x] Prisma 스키마에 ChatSession 모델 추가
- [x] 채팅 UI 구현 완료

## ⚠️ 사용자 작업 필요

### 1. GEMINI_API_KEY 설정 (필수)

**상태**: ❌ 미설정

**작업**:
1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급
2. Fly.io에 설정:
   ```bash
   fly secrets set GEMINI_API_KEY=your_api_key --app prompt-booster
   fly apps restart prompt-booster
   ```

**자세한 가이드**: [GEMINI_API_KEY_SETUP.md](./GEMINI_API_KEY_SETUP.md)

### 2. 데이터베이스 마이그레이션 실행

**상태**: ⚠️ 마이그레이션 파일 생성 필요

**작업**:
1. 로컬에서 마이그레이션 파일 생성 (선택사항)
2. Fly.io 배포 시 자동 실행됨 (`release_command` 설정됨)
3. 또는 수동 실행:
   ```bash
   fly ssh console
   prisma migrate deploy
   ```

### 3. 채팅 기능 테스트

**상태**: ⏳ GEMINI_API_KEY 설정 후 가능

**테스트 항목**:
- [ ] 채팅 질문/답변 플로우
- [ ] 프로젝트 이름 추천 기능
- [ ] 문서 생성 기능
- [ ] 에러 처리 동작

## 📋 현재 환경 변수 상태

```bash
# 확인 명령어
fly secrets list --app prompt-booster
```

**설정 완료**:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL

**설정 필요**:
- ❌ GEMINI_API_KEY

## 🚀 다음 단계

1. **GEMINI_API_KEY 설정** (최우선)
2. 앱 재시작
3. 채팅 기능 테스트
4. (선택) 채팅 히스토리 DB 연동 구현


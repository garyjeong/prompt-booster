# 환경 변수 설정 완료 상태

## ✅ 설정 완료된 환경 변수

- `DATABASE_URL` - PostgreSQL 데이터베이스 연결 (자동 설정됨)
- `NEXTAUTH_SECRET` - NextAuth 인증 시크릿 (설정 완료)
- `NEXTAUTH_URL` - NextAuth 콜백 URL (설정 완료)

## ⚠️ 설정 필요: GEMINI_API_KEY

채팅 기능을 사용하려면 `GEMINI_API_KEY`를 설정해야 합니다.

### 설정 방법

#### 방법 1: 스크립트 사용 (권장)

```bash
# GEMINI_API_KEY와 함께 실행
./setup-fly-env.sh your_gemini_api_key_here
```

#### 방법 2: 직접 설정

```bash
fly secrets set GEMINI_API_KEY=your_gemini_api_key_here --app prompt-booster
```

### Gemini API Key 발급 방법

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. **Get API Key** > **Create API Key** 클릭
4. 생성된 키를 복사하여 위 명령어에 사용

### 설정 후 앱 재시작

```bash
fly apps restart prompt-booster
```

## 🔍 환경 변수 확인

현재 설정된 환경 변수 확인:

```bash
fly secrets list --app prompt-booster
```

## 🧪 테스트

환경 변수 설정 후 앱이 정상 작동하는지 확인:

```bash
# 앱 로그 확인
fly logs --app prompt-booster

# 앱 상태 확인
fly status --app prompt-booster
```

## 📝 참고

- 자세한 내용은 [ENV_SETUP.md](./ENV_SETUP.md) 참조
- 배포 가이드는 [README_DEPLOY.md](./README_DEPLOY.md) 참조


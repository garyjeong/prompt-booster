# 환경 변수 설정 가이드

## Fly.io 환경 변수 설정

배포된 앱이 정상 작동하려면 다음 환경 변수를 Fly.io에 설정해야 합니다.

### 필수 환경 변수

```bash
# 1. Gemini API Key 설정
fly secrets set GEMINI_API_KEY=your_gemini_api_key

# 2. NextAuth Secret 생성 및 설정
# 먼저 시크릿 생성
openssl rand -base64 32

# 생성된 시크릿을 Fly.io에 설정
fly secrets set NEXTAUTH_SECRET=생성된_시크릿_값

# 3. NextAuth URL 설정
fly secrets set NEXTAUTH_URL=https://prompt-booster.fly.dev
```

### 선택사항 (Google OAuth)

```bash
# Google OAuth 설정 (로그인 기능 사용 시 필요)
fly secrets set GOOGLE_CLIENT_ID=your_google_client_id
fly secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 환경 변수 확인

설정한 환경 변수를 확인하려면:

```bash
fly secrets list
```

### 앱 재시작

환경 변수 설정 후 앱을 재시작해야 합니다:

```bash
fly apps restart prompt-booster
```

### 환경 변수 발급 방법

#### 1. Gemini API Key

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. **Get API Key** > **Create API Key** 클릭
4. 생성된 키를 `GEMINI_API_KEY`로 설정

#### 2. NextAuth Secret

터미널에서 다음 명령어 실행:

```bash
openssl rand -base64 32
```

생성된 문자열을 `NEXTAUTH_SECRET`으로 설정

#### 3. Google OAuth (선택사항)

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** > **사용자 인증 정보** 이동
4. **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
5. 애플리케이션 유형: **웹 애플리케이션**
6. 승인된 리디렉션 URI 추가: `https://prompt-booster.fly.dev/api/auth/callback/google`
7. 생성된 클라이언트 ID와 시크릿을 각각 설정

### 문제 해결

#### 환경 변수가 적용되지 않는 경우

1. 앱 재시작 확인:
   ```bash
   fly apps restart prompt-booster
   ```

2. 로그 확인:
   ```bash
   fly logs
   ```

3. 환경 변수 재설정:
   ```bash
   fly secrets set GEMINI_API_KEY=your_key --app prompt-booster
   ```

#### NextAuth 에러 (500 에러)

- `NEXTAUTH_SECRET`이 설정되었는지 확인
- `NEXTAUTH_URL`이 올바른 URL인지 확인 (https:// 포함)
- 앱 재시작 확인

#### Gemini API 에러

- `GEMINI_API_KEY`가 올바른지 확인
- API 키가 만료되지 않았는지 확인
- [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 상태 확인


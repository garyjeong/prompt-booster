# GEMINI_API_KEY 설정 가이드

## 중요: 채팅 기능 작동을 위해 필수

`GEMINI_API_KEY`가 설정되지 않으면 채팅 기능이 작동하지 않습니다.

## 설정 방법

### 1단계: Gemini API Key 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. **Get API Key** 버튼 클릭
4. **Create API Key** 선택
5. 생성된 API 키를 복사 (예: `AIzaSy...`)

### 2단계: Fly.io에 환경 변수 설정

```bash
# API 키를 환경 변수로 설정
fly secrets set GEMINI_API_KEY=your_api_key_here --app prompt-booster

# 예시:
# fly secrets set GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz --app prompt-booster
```

### 3단계: 앱 재시작

```bash
fly apps restart prompt-booster
```

### 4단계: 설정 확인

```bash
# 환경 변수 목록 확인 (값은 표시되지 않음)
fly secrets list --app prompt-booster

# 앱 로그 확인
fly logs --app prompt-booster
```

## 빠른 설정 스크립트 사용

```bash
# 스크립트 사용 (API 키를 인자로 전달)
./setup-fly-env.sh your_gemini_api_key_here
```

## 문제 해결

### API 키가 작동하지 않는 경우

1. **API 키 유효성 확인**
   - [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 상태 확인
   - API 키가 활성화되어 있는지 확인
   - 할당량이 남아있는지 확인

2. **환경 변수 재설정**
   ```bash
   fly secrets set GEMINI_API_KEY=your_new_api_key --app prompt-booster
   fly apps restart prompt-booster
   ```

3. **로그 확인**
   ```bash
   fly logs --app prompt-booster | grep -i "gemini\|api\|key"
   ```

### 에러 메시지

- **"AI 서비스에 연결할 수 없습니다"**: GEMINI_API_KEY가 설정되지 않았거나 유효하지 않음
- **"API key is invalid"**: API 키가 잘못되었거나 만료됨
- **"Quota exceeded"**: API 사용 한도 초과

## 참고

- API 키는 민감한 정보이므로 절대 공개 저장소에 커밋하지 마세요
- Fly.io secrets는 암호화되어 저장됩니다
- API 키 변경 시 앱을 재시작해야 변경사항이 적용됩니다


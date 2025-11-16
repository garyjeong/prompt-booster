# Gemini API 호출 문제 해결 가이드

## 🔍 문제 진단 체크리스트

### 1단계: 현재 환경 확인

#### 로컬 개발 환경인 경우
```bash
# .env.local 파일 확인
cat .env.local | grep GEMINI_API_KEY

# 또는
echo $GEMINI_API_KEY
```

#### Fly.io 배포 환경인 경우
```bash
# Fly.io 환경 변수 확인 (값은 표시되지 않음)
fly secrets list --app prompt-booster

# 앱 로그 확인
fly logs --app prompt-booster | grep -i "gemini\|api\|key\|error"
```

### 2단계: 환경 변수 설정 상태 확인

#### 로컬 환경
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일 내용 확인:
   ```bash
   # 파일이 있는지 확인
   ls -la .env.local
   
   # 내용 확인 (API 키는 마스킹됨)
   cat .env.local
   ```
3. 파일 형식 확인:
   ```bash
   # 올바른 형식
   GEMINI_API_KEY=AIzaSy...
   
   # 잘못된 형식 (공백, 따옴표 등)
   GEMINI_API_KEY = "AIzaSy..."  # ❌
   GEMINI_API_KEY='AIzaSy...'     # ❌
   ```

#### Fly.io 환경
```bash
# 환경 변수 목록 확인
fly secrets list --app prompt-booster

# GEMINI_API_KEY가 목록에 있는지 확인
# 없으면 설정 필요
```

### 3단계: API 키 유효성 확인

#### Google AI Studio에서 확인
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. 로그인 후 API 키 목록 확인
3. 현재 사용 중인 API 키 상태 확인:
   - ✅ **활성화됨**: 정상
   - ❌ **만료됨**: 새로 발급 필요
   - ⚠️ **제한됨**: 할당량 확인 필요

#### API 키 테스트 (curl)
```bash
# API 키가 유효한지 직접 테스트
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello"
      }]
    }]
  }'

# 성공 응답: {"candidates":[...]}
# 실패 응답: {"error": {...}}
```

### 4단계: 문제별 해결 방법

#### 문제 1: API 키가 설정되지 않음

**증상**: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다."

**해결**:

**로컬 환경**:
```bash
# .env.local 파일 생성/수정
echo "GEMINI_API_KEY=your_api_key_here" >> .env.local

# 개발 서버 재시작
pnpm dev
```

**Fly.io 환경**:
```bash
# 환경 변수 설정
fly secrets set GEMINI_API_KEY=your_api_key_here --app prompt-booster

# 앱 재시작
fly apps restart prompt-booster
```

#### 문제 2: API 키 만료됨

**증상**: "API key expired. Please renew the API key."

**해결**:

1. **새 API 키 발급**:
   - [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
   - 기존 키 삭제 또는 새 키 생성
   - 생성된 키 복사

2. **환경 변수 업데이트**:

   **로컬 환경**:
   ```bash
   # .env.local 파일 수정
   GEMINI_API_KEY=new_api_key_here
   
   # 개발 서버 재시작
   pnpm dev
   ```

   **Fly.io 환경**:
   ```bash
   # 환경 변수 업데이트
   fly secrets set GEMINI_API_KEY=new_api_key_here --app prompt-booster
   
   # 앱 재시작
   fly apps restart prompt-booster
   ```

#### 문제 3: API 키가 유효하지 않음

**증상**: "API key is invalid" 또는 "API_KEY_INVALID"

**해결**:

1. API 키 형식 확인:
   - 올바른 형식: `AIzaSy...` (대소문자 구분)
   - 공백이나 특수문자 제거 확인

2. API 키 복사 시 주의:
   - 전체 키가 복사되었는지 확인
   - 앞뒤 공백 제거

3. 환경 변수 재설정:
   ```bash
   # Fly.io
   fly secrets set GEMINI_API_KEY=correct_api_key_here --app prompt-booster
   fly apps restart prompt-booster
   ```

#### 문제 4: 할당량 초과

**증상**: "Quota exceeded" 또는 "429 Too Many Requests"

**해결**:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. API 및 서비스 > 할당량 확인
3. 할당량 증가 요청 또는 다음 날까지 대기

### 5단계: 앱 재시작 및 확인

#### 로컬 환경
```bash
# 개발 서버 중지 (Ctrl+C)
# 개발 서버 재시작
pnpm dev

# 브라우저에서 테스트
# http://localhost:3001
```

#### Fly.io 환경
```bash
# 앱 재시작
fly apps restart prompt-booster

# 상태 확인
fly status --app prompt-booster

# 로그 확인
fly logs --app prompt-booster
```

### 6단계: 최종 확인

#### 로컬 환경 테스트
1. 브라우저에서 `http://localhost:3001` 접속
2. 채팅 입력창에 메시지 입력
3. 에러 모달이 나타나지 않고 정상 응답이 오는지 확인

#### Fly.io 환경 테스트
1. 배포된 앱 URL 접속
2. 채팅 기능 테스트
3. 브라우저 개발자 도구 콘솔에서 에러 확인

## 🔧 빠른 진단 스크립트

로컬 환경에서 실행:

```bash
# 환경 변수 확인
echo "=== 환경 변수 확인 ==="
if [ -f .env.local ]; then
  echo "✅ .env.local 파일 존재"
  if grep -q "GEMINI_API_KEY" .env.local; then
    echo "✅ GEMINI_API_KEY 설정됨"
    KEY_LENGTH=$(grep "GEMINI_API_KEY" .env.local | cut -d'=' -f2 | tr -d ' ' | wc -c)
    echo "   키 길이: $((KEY_LENGTH-1)) 문자"
  else
    echo "❌ GEMINI_API_KEY 미설정"
  fi
else
  echo "❌ .env.local 파일 없음"
fi

# Node.js에서 환경 변수 확인
echo ""
echo "=== Node.js 환경 변수 확인 ==="
node -e "console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '설정됨 (' + process.env.GEMINI_API_KEY.length + '자)' : '미설정')"
```

## 📞 추가 도움

문제가 지속되면 다음을 확인하세요:

1. **Google AI Studio 상태**: [Google AI Studio Status](https://status.cloud.google.com/)
2. **프로젝트 로그**: `fly logs --app prompt-booster` 또는 로컬 터미널
3. **브라우저 콘솔**: 개발자 도구(F12) > Console 탭

## ✅ 정상 작동 확인

다음이 모두 정상이면 API가 정상 작동 중입니다:

- ✅ 환경 변수가 설정되어 있음
- ✅ API 키가 유효함 (Google AI Studio에서 확인)
- ✅ 앱이 재시작됨
- ✅ 에러 모달이 나타나지 않음
- ✅ 채팅 응답이 정상적으로 옴


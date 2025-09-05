# Prompt Booster 🚀

AI 코딩 도우미를 위한 프롬프트 개선 도구

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.10.9-teal?logo=chakraui)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 프로젝트 소개

**Prompt Booster**는 개인 개발자가 AI 코딩 도우미(ChatGPT, Gemini 등)에게 보낼 프롬프트를 자동으로 개선해주는 초경량 웹 애플리케이션입니다. 반복적인 프롬프트 수정 시간을 절감하고 AI 응답 품질을 높여 개발 생산성을 극대화합니다.

### ✨ 주요 기능

- 🤖 **AI 프롬프트 개선**: OpenAI GPT-4/3.5 및 Google Gemini 1.5 Pro를 활용한 지능형 프롬프트 최적화
- 🔑 **서버 API Key 관리**: 환경변수를 통한 안전한 API 키 관리 (사용자 입력 fallback 지원)
- 📱 **반응형 UI**: 모바일/데스크톱 완벽 지원하는 Chakra UI 기반 사용자 인터페이스
- 💾 **로컬 데이터 저장**: 브라우저 LocalStorage를 활용한 프롬프트 히스토리 관리
- ⚡ **고성능 캐싱**: 30분 API 응답 캐싱으로 빠른 반복 사용 지원
- 📋 **원클릭 복사**: 키보드 단축키(Ctrl+C) 지원하는 클립보드 복사 기능

### 🎯 사용 대상

- 개인 개발자 및 프로그래머
- AI 코딩 도우미를 자주 사용하는 개발자
- 효율적인 프롬프트 작성을 원하는 사용자

## 🚀 빠른 시작

### 필요 조건

- Node.js 18.14.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd spark-prompt
   ```

2. **의존성 설치**
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. **환경변수 설정**
   ```bash
   # .env.example을 복사하여 .env.local 생성
   cp .env.example .env.local
   ```
   
   `.env.local` 파일을 편집하여 API 키 설정:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google Gemini API Configuration  
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```

5. **브라우저에서 확인**
   
   [http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 🔑 API Key 발급 방법

### OpenAI API Key
1. [OpenAI Platform](https://platform.openai.com/api-keys) 방문
2. 계정 생성 또는 로그인
3. **API Keys** 메뉴에서 **Create new secret key** 클릭
4. 키 이름 설정 후 생성 (`sk-proj-...` 형태)

### Google Gemini API Key  
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. **Get API Key** → **Create API Key** 클릭
4. 생성된 키 복사 및 저장

## 🧪 테스트

### 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 테스트 watch 모드
npm run test:watch

# 커버리지 포함 테스트
npm run test:coverage
```

### 통합 테스트 (실제 API 호출)
```bash
# 통합 테스트 건너뛰기 (기본)
npm test

# 통합 테스트 포함 실행 (실제 API 비용 발생 주의)
SKIP_INTEGRATION_TESTS=false npm test
```

### 테스트 구조
```
tests/
├── api/              # API 라우트 테스트
├── components/       # React 컴포넌트 테스트  
├── utils/           # 유틸리티 함수 테스트
└── integration/     # 통합 테스트 (실제 API 호출)
```

## 🏗️ 프로젝트 구조

```
src/
├── app/
│   ├── api/improve/        # 프롬프트 개선 API 라우트
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 메인 페이지
├── components/
│   ├── ads/                # 광고 관련 컴포넌트
│   ├── PromptInput.tsx     # 프롬프트 입력 폼
│   ├── PromptResult.tsx    # 결과 표시 컴포넌트
│   ├── CopyButton.tsx      # 복사 버튼 컴포넌트
│   └── ApiKeyInput.tsx     # API 키 입력 모달
├── context/
│   ├── ApiKeyContext.tsx   # API 키 전역 상태
│   ├── PromptContext.tsx   # 프롬프트 상태 관리
│   └── AdsContext.tsx      # 광고 설정 관리
├── hooks/
│   └── useClipboard.ts     # 클립보드 커스텀 훅
├── lib/
│   ├── localstorage.ts     # LocalStorage 유틸리티
│   ├── api-cache.ts        # API 응답 캐싱
│   └── ads.ts              # 광고 관리 유틸리티
└── types/
    ├── api.ts              # API 타입 정의
    ├── prompt.ts           # 프롬프트 타입 정의
    └── ads.ts              # 광고 타입 정의
```

## 🛠️ 기술 스택

| 카테고리 | 기술 | 버전 | 선택 이유 |
|---------|------|------|-----------|
| **프레임워크** | Next.js | 15.5.2 | SSR/SSG, 라우팅, API 핸들링 통합 |
| **언어** | TypeScript | 5.0+ | 타입 안전성 및 개발 효율성 |
| **UI 라이브러리** | Chakra UI | 2.10.9 | 빠른 UI 개발, 반응형 지원 |
| **상태 관리** | React Context | - | 간단한 전역 상태 관리 |
| **데이터 저장** | LocalStorage | - | 클라이언트 사이드 데이터 지속성 |
| **AI API** | OpenAI, Gemini | - | 다양한 AI 모델 지원 |
| **테스팅** | Jest, Testing Library | - | 컴포넌트 및 유닛 테스트 |

## 📊 성능 최적화

- **API 응답 캐싱**: 30분간 동일 프롬프트 재사용 시 즉시 응답
- **코드 분할**: Dynamic Import를 통한 번들 크기 최적화  
- **메모이제이션**: React.memo, useMemo, useCallback 활용
- **반응형 이미지**: Next.js Image 컴포넌트 최적화

## 🔒 보안 고려사항

- **API 키 관리**: 
  - 서버 환경변수 우선 사용
  - 사용자 API 키는 브라우저 LocalStorage에만 저장
  - 서버로 API 키 전송 시 HTTPS 필수
- **데이터 보호**: 개인 프롬프트 데이터는 로컬에만 저장
- **입력 검증**: API 요청 유효성 검사 및 길이 제한 (2000자)

## 🚦 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수 설정
vercel env add OPENAI_API_KEY
vercel env add GEMINI_API_KEY
```

### 다른 플랫폼
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🤝 기여하기

1. 이 저장소를 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/your-repo/issues)
- **질문 및 토론**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 📈 향후 계획

- [ ] 프롬프트 히스토리 뷰어 UI 구현
- [ ] 다크모드 지원
- [ ] Claude 3.5 Sonnet 모델 추가
- [ ] 프롬프트 템플릿 기능
- [ ] 사용자 피드백 시스템
- [ ] 성능 모니터링 대시보드

---

**Prompt Booster**로 더 나은 AI 프롬프트를 만들어보세요! 🚀
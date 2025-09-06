/**
 * Demo 모드 프롬프트 개선 로직
 * API 키 없이도 작동하는 규칙 기반 프롬프트 개선 시스템
 */

/** 프롬프트 개선 패턴 인터페이스 */
interface ImprovementPattern {
	/** 패턴 매칭 조건 */
	condition: (prompt: string) => boolean;
	/** 개선 적용 함수 */
	improve: (prompt: string) => string;
	/** 패턴 설명 */
	description: string;
	/** 우선순위 (높을수록 우선) */
	priority: number;
}

/** 기본 프롬프트 개선 패턴들 */
const IMPROVEMENT_PATTERNS: ImprovementPattern[] = [
	{
		condition: (prompt) =>
			/^.{1,20}$/.test(prompt.trim()) && !prompt.includes("구체적"),
		improve: (prompt) => `${prompt}에 대해 구체적으로 설명해주세요.

**요구사항:**
- 상세한 단계별 가이드 제공
- 실제 예시 코드 포함
- 주의사항 및 베스트 프랙티스 설명
- 오류 처리 방법 포함

**출력 형식:**
- 코드 블록으로 예시 제공
- 각 단계마다 설명 추가
- 관련 문서나 참고자료 링크 (가능한 경우)`,
		description: "너무 짧은 프롬프트를 구체화",
		priority: 9,
	},

	{
		condition: (prompt) =>
			prompt.includes("코드") &&
			!prompt.includes("언어") &&
			!prompt.includes("프레임워크"),
		improve: (prompt) => `${prompt}

**기술 스택 정보:**
- 사용할 프로그래밍 언어: [TypeScript/JavaScript/Python 등 명시]
- 프레임워크/라이브러리: [React/Next.js/Express 등 명시]
- 개발 환경: [Node.js 버전, 패키지 매니저 등]

**구현 요구사항:**
- 타입 안전성 고려 (TypeScript 사용 시)
- 에러 핸들링 포함
- 코드 주석으로 설명 추가
- 테스트 가능한 구조로 작성

**예상 출력:**
- 완전한 코드 구현
- 사용법 예시
- 주요 함수/클래스 설명`,
		description: "코드 관련 프롬프트에 기술 스택 정보 추가",
		priority: 8,
	},

	{
		condition: (prompt) =>
			prompt.includes("버그") ||
			prompt.includes("오류") ||
			prompt.includes("에러"),
		improve: (prompt) => `${prompt}

**디버깅 정보 제공:**
- 발생하는 정확한 에러 메시지 (있는 경우)
- 에러가 발생하는 코드 부분
- 예상했던 동작 vs 실제 동작
- 사용 중인 환경 (브라우저, Node.js 버전 등)

**문제 해결 요청:**
1. 에러 원인 분석
2. 단계별 해결 방법 제시
3. 유사한 문제 예방법
4. 코드 개선 제안

**출력 형식:**
- 문제 원인 설명
- 수정된 코드 제공
- 테스트 방법 안내
- 추가 개선 사항 제안`,
		description: "버그/에러 관련 프롬프트에 디버깅 정보 추가",
		priority: 8,
	},

	{
		condition: (prompt) =>
			prompt.includes("리팩터링") || prompt.includes("개선"),
		improve: (prompt) => `${prompt}

**리팩터링 목표:**
- 코드 가독성 개선
- 성능 최적화
- 유지보수성 향상
- 재사용성 증대

**현재 코드 분석 요청:**
- 기존 코드의 문제점 식별
- 개선 가능한 부분 설명
- 베스트 프랙티스 적용

**개선 후 제공사항:**
- 리팩터링된 코드
- 변경사항 설명
- 성능 개선 효과
- 코드 품질 향상 포인트

**검증 방법:**
- 기존 기능 유지 확인
- 테스트 케이스 제안`,
		description: "리팩터링 요청에 세부 목표 및 분석 기준 추가",
		priority: 7,
	},

	{
		condition: (prompt) => /컴포넌트|component/i.test(prompt),
		improve: (prompt) => `${prompt}

**컴포넌트 설계 요구사항:**
- Props 인터페이스 정의 (TypeScript 사용 시)
- 재사용 가능한 구조로 설계
- 접근성(Accessibility) 고려
- 반응형 디자인 지원

**구현 사항:**
- 상태 관리 방식 (useState, useReducer 등)
- 이벤트 핸들러 구현
- 스타일링 방식 (CSS Modules, Styled Components 등)
- 에러 경계(Error Boundary) 고려

**출력 요청:**
- 완전한 컴포넌트 코드
- 사용 예시
- Props 문서화
- 스타일 가이드 (필요시)

**테스트:**
- 단위 테스트 예시
- 스토리북 스토리 (해당하는 경우)`,
		description: "컴포넌트 개발 요청에 설계 원칙 추가",
		priority: 7,
	},

	{
		condition: (prompt) => /api|서버|백엔드/i.test(prompt),
		improve: (prompt) => `${prompt}

**API 설계 요구사항:**
- RESTful 원칙 준수
- HTTP 상태 코드 적절한 사용
- 요청/응답 데이터 타입 정의
- 에러 응답 표준화

**보안 고려사항:**
- 입력 데이터 검증
- 인증/권한 확인 (필요시)
- CORS 설정
- Rate Limiting

**구현 사항:**
- 미들웨어 사용 패턴
- 데이터베이스 연동 (해당하는 경우)
- 로깅 및 에러 처리
- 성능 최적화

**문서화:**
- API 엔드포인트 명세
- 요청/응답 예시
- 에러 코드 정의
- 사용법 가이드`,
		description: "API/백엔드 요청에 표준 설계 원칙 추가",
		priority: 6,
	},

	{
		condition: (prompt) => prompt.length < 50,
		improve: (prompt) => `${prompt}

**추가 정보 요청:**
- 구체적인 요구사항 명시
- 예상 사용 사례 설명
- 제약 조건이나 한계 사항
- 원하는 출력 형태

**구현 고려사항:**
- 성능 요구사항
- 호환성 고려사항
- 확장성 요구사항
- 유지보수성

**출력 형식:**
- 단계별 구현 방법
- 코드 예시 포함
- 관련 문서 참조
- 추가 학습 자료 제안`,
		description: "짧은 프롬프트에 맥락 정보 추가",
		priority: 5,
	},
];

/** 프롬프트 분석 및 카테고리 감지 */
function analyzePrompt(prompt: string): {
	category: string;
	keywords: string[];
	complexity: "simple" | "medium" | "complex";
} {
	// 카테고리 감지
	let category = "general";
	if (/react|컴포넌트|jsx|component/i.test(prompt)) category = "react";
	else if (/api|서버|백엔드|express|fastify/i.test(prompt))
		category = "backend";
	else if (/버그|에러|오류|디버그/i.test(prompt)) category = "debugging";
	else if (/리팩터|개선|최적화/i.test(prompt)) category = "refactoring";
	else if (/테스트|test|jest|cypress/i.test(prompt)) category = "testing";
	else if (/스타일|css|디자인/i.test(prompt)) category = "styling";

	// 키워드 추출
	const keywords = prompt.match(/\w+/g) || [];

	// 복잡도 판단
	let complexity: "simple" | "medium" | "complex" = "simple";
	if (prompt.length > 100) complexity = "medium";
	if (prompt.length > 200 || keywords.length > 20) complexity = "complex";

	return { category, keywords, complexity };
}

/** 메인 Demo 모드 프롬프트 개선 함수 */
export async function improvePromptInDemoMode(prompt: string): Promise<{
	improvedPrompt: string;
	appliedPatterns: string[];
	analysis: ReturnType<typeof analyzePrompt>;
	isDemoMode: true;
}> {
	// 프롬프트 분석
	const analysis = analyzePrompt(prompt);

	// 적용 가능한 패턴 찾기 (우선순위 순으로 정렬)
	const applicablePatterns = IMPROVEMENT_PATTERNS.filter((pattern) =>
		pattern.condition(prompt)
	).sort((a, b) => b.priority - a.priority);

	let improvedPrompt = prompt;
	const appliedPatterns: string[] = [];

	// 가장 우선순위가 높은 패턴 적용 (최대 2개)
	for (const pattern of applicablePatterns.slice(0, 2)) {
		improvedPrompt = pattern.improve(improvedPrompt);
		appliedPatterns.push(pattern.description);
	}

	// 기본 개선이 적용되지 않은 경우 일반적인 개선 적용
	if (appliedPatterns.length === 0) {
		improvedPrompt = `${prompt}

**명확한 요구사항 정의:**
- 구체적으로 무엇을 원하는지 명시
- 예상 결과물 형태 설명
- 제약 조건이나 선호사항 포함

**추가 정보 제공:**
- 사용 환경 및 맥락
- 관련 기술 스택
- 난이도 수준 (초급/중급/고급)

**출력 요청 사항:**
- 단계별 설명
- 실제 예시 포함  
- 주의사항 안내
- 추가 학습 자료 제안`;

		appliedPatterns.push("일반적인 프롬프트 구조화 적용");
	}

	// Demo 모드 안내 메시지 추가
	const finalPrompt = `🎭 **Demo 모드로 개선된 프롬프트** 
(실제 AI API 사용 시 더욱 정교한 개선이 가능합니다)

${improvedPrompt}

---
**💡 개선 포인트:** ${appliedPatterns.join(", ")}
**📊 분석 결과:** ${analysis.category} 카테고리, ${analysis.complexity} 복잡도`;

	return {
		improvedPrompt: finalPrompt,
		appliedPatterns,
		analysis,
		isDemoMode: true as const,
	};
}

/** Demo 모드 상태 확인 */
export function isDemoModeRequired(apiKey?: string): boolean {
	return !apiKey || apiKey.trim().length === 0;
}

/** Demo 모드 정보 */
export function getDemoModeInfo() {
	return {
		name: "Demo Mode",
		description: "API 키 없이 작동하는 규칙 기반 프롬프트 개선",
		features: [
			"카테고리별 맞춤 개선",
			"구조화된 프롬프트 생성",
			"베스트 프랙티스 적용",
			"즉시 사용 가능",
		],
		limitations: [
			"실제 AI 분석 없음",
			"패턴 기반 규칙 적용",
			"복잡한 맥락 이해 제한",
		],
	};
}

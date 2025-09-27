/**
 * API 관련 타입 정의
 */

import type {
	PromptComparisonAnalysis,
	ScoringConfig,
	ScoringCriteriaType,
} from "./scoring";

/** 지원하는 AI 프로바이더 */
export type AIProvider = "gemini" | "demo" | "demo-fallback";

/** 프롬프트 개선 요청 */
export interface PromptImprovementRequest {
	/** 개선할 원본 프롬프트 */
	prompt: string;
	/** Gemini API 키 */
	geminiKey?: string;
	/** 점수화 설정(가중치/임계값 커스터마이징) */
	scoringConfig?: Partial<ScoringConfig>;
}

/** 프롬프트 개선 응답 */
export interface PromptImprovementResponse {
	/** 개선된 프롬프트 */
	improvedPrompt: string;
	/** 사용된 AI 프로바이더 */
	provider: AIProvider;
	/** 원본 프롬프트 */
	originalPrompt: string;
	/** 처리 시간 (밀리초) */
	processingTime: number;
	/** Demo 모드 여부 */
	isDemoMode?: boolean;
	/** 점수화 분석 결과 (옵션) */
	scoringAnalysis?: PromptComparisonAnalysis;
}

/** API 에러 응답 */
export interface APIError {
	/** 에러 메시지 */
	error: string;
	/** 에러 코드 */
	code: string;
	/** 상세 정보 (옵션) */
	details?: string;
}

/** API 응답 래퍼 */
export type APIResponse<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: APIError;
	  };

/** Gemini 모델 타입 */
export type GeminiModel = "gemini-1.5-pro" | "gemini-1.5-flash";

/** AI 모델 설정 */
export interface AIModelConfig {
	gemini: {
		model: GeminiModel;
		maxTokens: number;
		temperature: number;
	};
}

/** 프롬프트 개선 옵션 */
export interface PromptImprovementOptions {
	/** 개선 스타일 */
	style?: "detailed" | "concise" | "structured";
	/** 대상 용도 */
	purpose?: "coding" | "debugging" | "review" | "general";
	/** 최대 응답 길이 */
	maxLength?: number;
}

/** 확장된 프롬프트 개선 요청 */
export interface ExtendedPromptImprovementRequest
	extends PromptImprovementRequest {
	/** 개선 옵션 */
	options?: PromptImprovementOptions;
}

/** 점수 비교 요청 (A/B 비교) */
export interface ScoringCompareRequest {
	/** 동일한 원본 프롬프트 */
	originalPrompt: string;
	/** 개선안 A */
	improvedPromptA: string;
	/** 개선안 B */
	improvedPromptB: string;
	/** 선택적 점수화 설정 */
	scoringConfig?: Partial<ScoringConfig>;
}

/** 점수 비교 응답 */
export interface ScoringCompareResponse {
	analysisA: PromptComparisonAnalysis;
	analysisB: PromptComparisonAnalysis;
	better: "A" | "B" | "equal";
	scoreDiff: number;
	criteriaDiffs: Array<{
		criterion: ScoringCriteriaType;
		scoreA: number;
		scoreB: number;
		diff: number;
	}>;
}

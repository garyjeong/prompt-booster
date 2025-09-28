/**
 * API 관련 타입 정의
 */

import type { PromptComparisonAnalysis } from "./scoring";

/** 지원하는 AI 프로바이더 */
export type AIProvider = "gemini" | "demo" | "demo-fallback";

/** 대상 모델 (Gemini 엔진으로 생성할 목표 모델 스타일) */
export type TargetModel =
	| "gpt-5"
	| "gemini-2.5-pro"
	| "claude-4-sonnet"
	| "claude-4-opus";

/** 프롬프트 개선 요청 */
export interface PromptImprovementRequest {
	/** 개선할 원본 프롬프트 */
	prompt: string;
	/** Gemini API 키 */
	geminiKey?: string;
	/** 생성할 목표 모델 스타일 (백워드 호환: 미지정 시 기본 전략 사용) */
	targetModel?: TargetModel;
}

/** 프롬프트 개선 응답 */
export interface PromptImprovementResponse {
	/** 개선된 프롬프트 */
	improvedPrompt: string;
	/** 사용된 AI 프로바이더 */
	provider: AIProvider;
	/** 생성된 목표 모델 스타일 (있다면) */
	targetModel?: TargetModel;
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

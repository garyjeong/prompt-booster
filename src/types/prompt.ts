/**
 * 프롬프트 상태 관리 관련 타입 정의
 */

import type { AIProvider } from "./api";

/** 단일 프롬프트 세션 데이터 */
export interface PromptSession {
	/** 세션 고유 ID */
	id: string;
	/** 원본 프롬프트 */
	originalPrompt: string;
	/** 개선된 프롬프트 */
	improvedPrompt: string;
	/** 사용된 AI 프로바이더 */
	provider: AIProvider;
	/** 처리 시간 (밀리초) */
	processingTime: number;
	/** 생성 시간 */
	createdAt: string;
	/** 복사 여부 */
	copied?: boolean;
}

/** 현재 프롬프트 작업 상태 */
export interface CurrentPromptState {
	/** 현재 입력된 원본 프롬프트 */
	originalPrompt: string;
	/** 현재 개선된 프롬프트 */
	improvedPrompt: string;
	/** 로딩 상태 */
	isLoading: boolean;
	/** 에러 메시지 */
	error: string;
	/** 마지막 업데이트 시간 */
	lastUpdated?: string;
}

/** 프롬프트 히스토리 관리 */
export interface PromptHistory {
	/** 세션들의 배열 */
	sessions: PromptSession[];
	/** 최대 히스토리 개수 */
	maxHistory: number;
	/** 마지막 세션 ID */
	lastSessionId?: string;
}

/** 전체 프롬프트 상태 */
export interface PromptState {
	/** 현재 작업 상태 */
	current: CurrentPromptState;
	/** 히스토리 */
	history: PromptHistory;
	/** 상태 로딩 중 여부 */
	isLoading: boolean;
	/** 자동 저장 활성화 여부 */
	autoSave: boolean;
}

/** 프롬프트 액션 타입 */
export interface PromptActions {
	/** 원본 프롬프트 설정 */
	setOriginalPrompt: (prompt: string) => void;
	/** 개선된 프롬프트 설정 */
	setImprovedPrompt: (prompt: string) => void;
	/** 로딩 상태 설정 */
	setLoading: (loading: boolean) => void;
	/** 에러 설정 */
	setError: (error: string) => void;
	/** 에러 초기화 */
	clearError: () => void;
	/** 현재 상태 초기화 */
	clearCurrent: () => void;
	/** 세션을 히스토리에 추가 */
	addToHistory: (session: Omit<PromptSession, "id" | "createdAt">) => void;
	/** 히스토리 초기화 */
	clearHistory: () => void;
	/** 특정 세션을 현재 상태로 복원 */
	restoreSession: (sessionId: string) => void;
	/** 세션 복사 상태 업데이트 */
	markSessionCopied: (sessionId: string) => void;
	/** 모든 데이터 초기화 */
	resetAll: () => void;
}

/** 프롬프트 컨텍스트 타입 */
export interface PromptContextType extends PromptState, PromptActions {}

/** LocalStorage 저장용 데이터 구조 */
export interface PromptStorageData {
	/** 현재 상태 (로딩/에러 제외) */
	current: Pick<
		CurrentPromptState,
		"originalPrompt" | "improvedPrompt" | "lastUpdated"
	>;
	/** 히스토리 */
	history: PromptHistory;
	/** 자동 저장 설정 */
	autoSave: boolean;
	/** 저장 시간 */
	savedAt: string;
}

/** 프롬프트 상태 기본값 */
export const DEFAULT_PROMPT_STATE: PromptState = {
	current: {
		originalPrompt: "",
		improvedPrompt: "",
		isLoading: false,
		error: "",
	},
	history: {
		sessions: [],
		maxHistory: 50, // 최대 50개 세션 히스토리 유지
	},
	isLoading: false,
	autoSave: true,
};

/** LocalStorage 키 상수 */
export const PROMPT_STORAGE_KEY = "prompt_booster_prompt_data";

/** 세션 ID 생성 함수 */
export function generateSessionId(): string {
	return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/** 현재 시간을 ISO 문자열로 반환 */
export function getCurrentTimestamp(): string {
	return new Date().toISOString();
}

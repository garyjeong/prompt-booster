/**
 * 프롬프트 상태 관리 관련 타입 정의
 */

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

/** 전체 프롬프트 상태 */
export interface PromptState {
	/** 현재 작업 상태 */
	current: CurrentPromptState;
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
	isLoading: false,
	autoSave: true,
};

/** LocalStorage 키 상수 */
export const PROMPT_STORAGE_KEY = "prompt_booster_prompt_data";


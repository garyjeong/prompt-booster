/**
 * LocalStorage를 사용한 데이터 관리 유틸리티
 * - API 키 관리
 * - 프롬프트 상태 관리
 */

import type { PromptStorageData, PromptState } from "@/types/prompt";
import {
	DEFAULT_PROMPT_STATE,
	PROMPT_STORAGE_KEY,
	getCurrentTimestamp,
} from "@/types/prompt";

export interface ApiKeys {
	openai?: string;
	gemini?: string;
}

const API_KEYS_STORAGE_KEY = "prompt_booster_api_keys";

/**
 * LocalStorage에서 API 키들을 가져옵니다.
 * @returns API 키 객체 또는 빈 객체
 */
export function getApiKeys(): ApiKeys {
	try {
		if (typeof window === "undefined") {
			return {};
		}

		const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
		if (!stored) {
			return {};
		}

		const parsed = JSON.parse(stored);
		return parsed || {};
	} catch (error) {
		console.error("API 키 로드 실패:", error);
		return {};
	}
}

/**
 * 특정 API 키를 가져옵니다.
 * @param provider API 제공자 ('openai' | 'gemini')
 * @returns API 키 문자열 또는 undefined
 */
export function getApiKey(provider: keyof ApiKeys): string | undefined {
	const keys = getApiKeys();
	return keys[provider];
}

/**
 * API 키들을 LocalStorage에 저장합니다.
 * @param keys 저장할 API 키 객체
 */
export function setApiKeys(keys: ApiKeys): void {
	try {
		if (typeof window === "undefined") {
			return;
		}

		localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
	} catch (error) {
		console.error("API 키 저장 실패:", error);
		throw new Error("API 키 저장에 실패했습니다.");
	}
}

/**
 * 특정 API 키를 저장합니다.
 * @param provider API 제공자 ('openai' | 'gemini')
 * @param key 저장할 API 키
 */
export function setApiKey(provider: keyof ApiKeys, key: string): void {
	const currentKeys = getApiKeys();
	setApiKeys({ ...currentKeys, [provider]: key });
}

/**
 * 특정 API 키를 삭제합니다.
 * @param provider API 제공자 ('openai' | 'gemini')
 */
export function removeApiKey(provider: keyof ApiKeys): void {
	const currentKeys = getApiKeys();
	delete currentKeys[provider];
	setApiKeys(currentKeys);
}

/**
 * 모든 API 키를 삭제합니다.
 */
export function clearApiKeys(): void {
	try {
		if (typeof window === "undefined") {
			return;
		}

		localStorage.removeItem(API_KEYS_STORAGE_KEY);
	} catch (error) {
		console.error("API 키 삭제 실패:", error);
	}
}

/**
 * API 키가 설정되어 있는지 확인합니다.
 * @param provider API 제공자 ('openai' | 'gemini')
 * @returns 키가 존재하고 비어있지 않으면 true
 */
export function hasApiKey(provider: keyof ApiKeys): boolean {
	const key = getApiKey(provider);
	return !!key && key.trim().length > 0;
}

/**
 * 어떤 API 키라도 설정되어 있는지 확인합니다.
 * @returns 하나 이상의 API 키가 설정되어 있으면 true
 */
export function hasAnyApiKey(): boolean {
	return hasApiKey("openai") || hasApiKey("gemini");
}

/**
 * API 키의 앞 4자리와 뒤 4자리만 보여주는 마스킹된 문자열을 반환합니다.
 * @param key 마스킹할 API 키
 * @returns 마스킹된 키 문자열
 */
export function maskApiKey(key: string): string {
	if (!key || key.length < 8) {
		return "****";
	}

	const start = key.slice(0, 4);
	const end = key.slice(-4);
	const middle = "*".repeat(Math.max(4, key.length - 8));

	return `${start}${middle}${end}`;
}

// ====================================
// 프롬프트 데이터 관리 함수들
// ====================================

/**
 * LocalStorage에서 프롬프트 데이터를 가져옵니다.
 * @returns 프롬프트 저장 데이터 또는 기본값
 */
export function getPromptData(): PromptStorageData | null {
	try {
		if (typeof window === "undefined") {
			return null;
		}

		const stored = localStorage.getItem(PROMPT_STORAGE_KEY);
		if (!stored) {
			return null;
		}

		const parsed: PromptStorageData = JSON.parse(stored);

		// 데이터 유효성 검사
		if (!parsed || typeof parsed !== "object") {
			return null;
		}

		return parsed;
	} catch (error) {
		console.error("프롬프트 데이터 로드 실패:", error);
		return null;
	}
}

/**
 * 프롬프트 상태를 LocalStorage에 저장합니다.
 * @param state 저장할 프롬프트 상태
 */
export function setPromptData(state: PromptState): void {
	try {
		if (typeof window === "undefined") {
			return;
		}

		// 저장용 데이터 구조로 변환 (로딩 상태 등 제외)
		const storageData: PromptStorageData = {
			current: {
				originalPrompt: state.current.originalPrompt,
				improvedPrompt: state.current.improvedPrompt,
				lastUpdated: getCurrentTimestamp(),
			},
			history: state.history,
			autoSave: state.autoSave,
			savedAt: getCurrentTimestamp(),
		};

		localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(storageData));
	} catch (error) {
		console.error("프롬프트 데이터 저장 실패:", error);
		throw error;
	}
}

/**
 * 저장된 프롬프트 데이터에서 PromptState로 변환합니다.
 * @param data 저장된 데이터
 * @returns 복원된 프롬프트 상태
 */
export function restorePromptState(data: PromptStorageData): PromptState {
	return {
		current: {
			originalPrompt: data.current.originalPrompt || "",
			improvedPrompt: data.current.improvedPrompt || "",
			isLoading: false, // 복원 시 로딩 상태는 항상 false
			error: "", // 복원 시 에러는 초기화
			lastUpdated: data.current.lastUpdated,
		},
		history: {
			sessions: data.history?.sessions || [],
			maxHistory:
				data.history?.maxHistory || DEFAULT_PROMPT_STATE.history.maxHistory,
			lastSessionId: data.history?.lastSessionId,
		},
		isLoading: false,
		autoSave: data.autoSave !== undefined ? data.autoSave : true,
	};
}

/**
 * 프롬프트 데이터를 LocalStorage에서 삭제합니다.
 */
export function clearPromptData(): void {
	try {
		if (typeof window === "undefined") {
			return;
		}

		localStorage.removeItem(PROMPT_STORAGE_KEY);
	} catch (error) {
		console.error("프롬프트 데이터 삭제 실패:", error);
		throw error;
	}
}

/**
 * 프롬프트 데이터의 존재 여부를 확인합니다.
 * @returns 데이터 존재 여부
 */
export function hasPromptData(): boolean {
	try {
		if (typeof window === "undefined") {
			return false;
		}

		const data = localStorage.getItem(PROMPT_STORAGE_KEY);
		return !!data;
	} catch (error) {
		console.error("프롬프트 데이터 확인 실패:", error);
		return false;
	}
}

/**
 * LocalStorage 용량 확인 (대략적)
 * @returns 사용 중인 용량 (bytes)
 */
export function getStorageSize(): number {
	try {
		if (typeof window === "undefined") {
			return 0;
		}

		let total = 0;
		for (const key in localStorage) {
			if (localStorage.hasOwnProperty(key)) {
				total += localStorage[key].length + key.length;
			}
		}
		return total;
	} catch (error) {
		console.error("저장소 크기 확인 실패:", error);
		return 0;
	}
}

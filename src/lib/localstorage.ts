/**
 * LocalStorage를 사용한 데이터 관리 유틸리티
 * - API 키 관리
 * - 프롬프트 상태 관리
 */

import {
    apiKeyStorageManager,
    ApiKeyStorageManager,
} from "@/lib/storage/ApiKeyStorageManager";
import { getCurrentTimestamp } from "@/lib/utils";
import type { PromptState, PromptStorageData } from "@/types/prompt";
import { PROMPT_STORAGE_KEY } from "@/types/prompt";

// Re-export API Key 관련 타입과 함수들 (하위 호환성 유지)
export type { ApiKeys, ApiProvider } from "@/lib/storage/ApiKeyStorageManager";
export { apiKeyStorageManager, ApiKeyStorageManager };

// 하위 호환성을 위한 함수들
export async function getApiKeys() {
	return await apiKeyStorageManager.getAll();
}

export async function getApiKey(provider: "gemini") {
	return await apiKeyStorageManager.get(provider);
}

export async function setApiKeys(keys: { gemini?: string }) {
	return await apiKeyStorageManager.saveAll(keys);
}

export async function setApiKey(provider: "gemini", key: string) {
	return await apiKeyStorageManager.save(provider, key);
}

export async function removeApiKey(provider: "gemini") {
	return await apiKeyStorageManager.remove(provider);
}

export async function clearApiKeys() {
	return await apiKeyStorageManager.clear();
}

export async function hasApiKey(provider: "gemini") {
	return await apiKeyStorageManager.has(provider);
}

export async function hasAnyApiKey() {
	return await apiKeyStorageManager.hasAny();
}

export function maskApiKey(key: string) {
	return ApiKeyStorageManager.maskKey(key);
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

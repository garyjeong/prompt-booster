/**
 * API 키 전용 저장소 관리자
 * Single Responsibility Principle에 따라 API 키 관리만 담당
 */

import {
	LocalStorageManager,
	createLocalStorageManager,
} from "./LocalStorageManager";
import { safeTrim, isEmpty } from "@/lib/utils";

export interface ApiKeys {
	openai?: string;
	gemini?: string;
}

export type ApiProvider = keyof ApiKeys;

/**
 * API 키 검증 함수
 * @param data 검증할 데이터
 * @returns 유효성 여부
 */
function validateApiKeys(data: unknown): boolean {
	if (!data || typeof data !== "object") {
		return false;
	}

	const keys = data as Record<string, unknown>;

	// 키가 있으면 문자열이어야 함
	if (keys.openai !== undefined && typeof keys.openai !== "string") {
		return false;
	}
	if (keys.gemini !== undefined && typeof keys.gemini !== "string") {
		return false;
	}

	return true;
}

/**
 * API 키 저장소 관리자 클래스
 */
export class ApiKeyStorageManager {
	private readonly storage: LocalStorageManager<ApiKeys>;

	constructor() {
		this.storage = createLocalStorageManager<ApiKeys>({
			key: "prompt_booster_api_keys",
			defaultValueFactory: () => ({}),
			validator: validateApiKeys,
		});
	}

	/**
	 * 모든 API 키를 가져옵니다.
	 * @returns API 키 객체
	 */
	async getAll(): Promise<ApiKeys> {
		const keys = await this.storage.load();
		return keys || {};
	}

	/**
	 * 특정 제공자의 API 키를 가져옵니다.
	 * @param provider 제공자 키
	 * @returns API 키 또는 undefined
	 */
	async get(provider: ApiProvider): Promise<string | undefined> {
		const keys = await this.getAll();
		return keys[provider];
	}

	/**
	 * 모든 API 키를 저장합니다.
	 * @param keys 저장할 API 키 객체
	 */
	async saveAll(keys: ApiKeys): Promise<void> {
		// 키 정리 (빈 문자열이나 공백 제거)
		const cleanedKeys: ApiKeys = {};

		if (!isEmpty(keys.openai)) {
			cleanedKeys.openai = safeTrim(keys.openai);
		}
		if (!isEmpty(keys.gemini)) {
			cleanedKeys.gemini = safeTrim(keys.gemini);
		}

		await this.storage.save(cleanedKeys);
	}

	/**
	 * 특정 제공자의 API 키를 저장합니다.
	 * @param provider 제공자 키
	 * @param key 저장할 API 키
	 */
	async save(provider: ApiProvider, key: string): Promise<void> {
		if (isEmpty(key)) {
			throw new Error("API 키가 비어있습니다.");
		}

		await this.storage.update((current) => ({
			...current,
			[provider]: safeTrim(key),
		}));
	}

	/**
	 * 특정 제공자의 API 키를 삭제합니다.
	 * @param provider 제공자 키
	 */
	async remove(provider: ApiProvider): Promise<void> {
		await this.storage.update((current) => {
			const updated = { ...current };
			delete updated[provider];
			return updated;
		});
	}

	/**
	 * 모든 API 키를 삭제합니다.
	 */
	async clear(): Promise<void> {
		await this.storage.delete();
	}

	/**
	 * 특정 제공자의 API 키가 설정되어 있는지 확인합니다.
	 * @param provider 제공자 키
	 * @returns 키 존재 여부
	 */
	async has(provider: ApiProvider): Promise<boolean> {
		const key = await this.get(provider);
		return !isEmpty(key);
	}

	/**
	 * 어떤 API 키라도 설정되어 있는지 확인합니다.
	 * @returns 키 존재 여부
	 */
	async hasAny(): Promise<boolean> {
		const keys = await this.getAll();
		return !isEmpty(keys.openai) || !isEmpty(keys.gemini);
	}

	/**
	 * API 키를 마스킹된 형태로 반환합니다.
	 * @param key 마스킹할 키
	 * @returns 마스킹된 키
	 */
	static maskKey(key: string): string {
		if (isEmpty(key) || key.length < 8) {
			return "****";
		}

		const start = key.slice(0, 4);
		const end = key.slice(-4);
		return `${start}****${end}`;
	}

	/**
	 * 모든 API 키를 마스킹된 형태로 가져옵니다.
	 * @returns 마스킹된 API 키 객체
	 */
	async getAllMasked(): Promise<Record<ApiProvider, string>> {
		const keys = await this.getAll();
		return {
			openai: keys.openai ? ApiKeyStorageManager.maskKey(keys.openai) : "",
			gemini: keys.gemini ? ApiKeyStorageManager.maskKey(keys.gemini) : "",
		};
	}

	/**
	 * API 키의 유효성을 간단히 검사합니다.
	 * @param provider 제공자
	 * @param key 검사할 키
	 * @returns 유효성 여부
	 */
	static validateKeyFormat(provider: ApiProvider, key: string): boolean {
		if (isEmpty(key)) {
			return false;
		}

		const trimmedKey = safeTrim(key);

		switch (provider) {
			case "openai":
				// OpenAI 키는 'sk-'로 시작하고 최소 40자 이상
				return trimmedKey.startsWith("sk-") && trimmedKey.length >= 40;
			case "gemini":
				// Gemini 키는 'AIza'로 시작하고 최소 35자 이상
				return trimmedKey.startsWith("AIza") && trimmedKey.length >= 35;
			default:
				return false;
		}
	}

	/**
	 * 저장소 사용량을 조회합니다.
	 * @returns 사용량 정보
	 */
	async getStorageInfo(): Promise<{
		hasData: boolean;
		keyCount: number;
		providers: ApiProvider[];
	}> {
		const keys = await this.getAll();
		const providers: ApiProvider[] = [];

		if (!isEmpty(keys.openai)) providers.push("openai");
		if (!isEmpty(keys.gemini)) providers.push("gemini");

		return {
			hasData: providers.length > 0,
			keyCount: providers.length,
			providers,
		};
	}
}

// 싱글톤 인스턴스 생성
export const apiKeyStorageManager = new ApiKeyStorageManager();

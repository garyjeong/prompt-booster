/**
 * LocalStorage 기반 저장소 관리자
 * IStorageManager 인터페이스의 LocalStorage 구현체
 */

import { IStorageManager, StorageConfig } from "./IStorageManager";
import { getCurrentTimestamp } from "@/lib/utils";

/**
 * 만료 가능한 데이터 래퍼
 */
interface ExpirationWrapper<T> {
	data: T;
	expiresAt?: string;
	createdAt: string;
}

/**
 * LocalStorage 관리자 클래스
 */
export class LocalStorageManager<T> implements IStorageManager<T> {
	private readonly config: StorageConfig;

	constructor(config: StorageConfig) {
		this.config = config;
	}

	/**
	 * 데이터를 저장합니다.
	 * @param data 저장할 데이터
	 */
	async save(data: T): Promise<void> {
		try {
			if (typeof window === "undefined") {
				throw new Error("LocalStorage는 브라우저 환경에서만 사용 가능합니다.");
			}

			// 데이터 검증
			if (this.config.validator && !this.config.validator(data)) {
				throw new Error("데이터 검증에 실패했습니다.");
			}

			// 만료 시간이 설정된 경우 래퍼 생성
			let dataToStore: T | ExpirationWrapper<T> = data;
			if (this.config.ttl) {
				const expiresAt = new Date(Date.now() + this.config.ttl).toISOString();
				dataToStore = {
					data,
					expiresAt,
					createdAt: getCurrentTimestamp(),
				};
			}

			// 암호화 처리 (향후 구현 가능)
			const serializedData = JSON.stringify(dataToStore);
			if (this.config.encrypted) {
				// TODO: 암호화 로직 구현
				console.warn("암호화가 요청되었지만 아직 구현되지 않았습니다.");
			}

			localStorage.setItem(this.config.key, serializedData);
		} catch (error) {
			console.error(`데이터 저장 실패 (${this.config.key}):`, error);
			throw new Error(
				`데이터 저장에 실패했습니다: ${
					error instanceof Error ? error.message : "알 수 없는 오류"
				}`
			);
		}
	}

	/**
	 * 데이터를 불러옵니다.
	 * @returns 저장된 데이터 또는 null
	 */
	async load(): Promise<T | null> {
		try {
			if (typeof window === "undefined") {
				return null;
			}

			const stored = localStorage.getItem(this.config.key);
			if (!stored) {
				return this.getDefaultValue();
			}

			// 역직렬화
			let parsedData: T | ExpirationWrapper<T>;
			try {
				parsedData = JSON.parse(stored);
			} catch {
				console.warn(
					`잘못된 JSON 데이터 (${this.config.key}), 기본값으로 복원`
				);
				return this.getDefaultValue();
			}

			// 만료 시간 확인
			if (this.isExpirationWrapper(parsedData)) {
				if (
					parsedData.expiresAt &&
					new Date(parsedData.expiresAt) < new Date()
				) {
					console.info(`만료된 데이터 삭제 (${this.config.key})`);
					await this.delete();
					return this.getDefaultValue();
				}
				return parsedData.data;
			}

			// 데이터 검증
			if (this.config.validator && !this.config.validator(parsedData)) {
				console.warn(`데이터 검증 실패 (${this.config.key}), 기본값으로 복원`);
				return this.getDefaultValue();
			}

			return parsedData;
		} catch (error) {
			console.error(`데이터 로드 실패 (${this.config.key}):`, error);
			return null;
		}
	}

	/**
	 * 데이터를 삭제합니다.
	 */
	async delete(): Promise<void> {
		try {
			if (typeof window === "undefined") {
				return;
			}

			localStorage.removeItem(this.config.key);
		} catch (error) {
			console.error(`데이터 삭제 실패 (${this.config.key}):`, error);
			throw new Error(
				`데이터 삭제에 실패했습니다: ${
					error instanceof Error ? error.message : "알 수 없는 오류"
				}`
			);
		}
	}

	/**
	 * 데이터의 존재 여부를 확인합니다.
	 * @returns 데이터 존재 여부
	 */
	async exists(): Promise<boolean> {
		try {
			if (typeof window === "undefined") {
				return false;
			}

			const data = await this.load();
			return data !== null;
		} catch (error) {
			console.error(`데이터 존재 확인 실패 (${this.config.key}):`, error);
			return false;
		}
	}

	/**
	 * 데이터를 업데이트합니다.
	 * @param updater 업데이트 함수
	 */
	async update(updater: (current: T | null) => T): Promise<void> {
		const current = await this.load();
		const updated = updater(current);
		await this.save(updated);
	}

	/**
	 * 기본값을 반환합니다.
	 * @returns 기본값 또는 null
	 */
	private getDefaultValue(): T | null {
		if (this.config.defaultValueFactory) {
			return this.config.defaultValueFactory() as T;
		}
		return null;
	}

	/**
	 * 만료 래퍼인지 확인합니다.
	 * @param data 확인할 데이터
	 * @returns 만료 래퍼 여부
	 */
	private isExpirationWrapper(
		data: T | ExpirationWrapper<T>
	): data is ExpirationWrapper<T> {
		return (
			typeof data === "object" &&
			data !== null &&
			"data" in data &&
			"createdAt" in data
		);
	}
}

/**
 * LocalStorage 관리자 팩토리 함수
 * @param config 저장소 설정
 * @returns LocalStorage 관리자 인스턴스
 */
export function createLocalStorageManager<T>(
	config: StorageConfig
): LocalStorageManager<T> {
	return new LocalStorageManager<T>(config);
}

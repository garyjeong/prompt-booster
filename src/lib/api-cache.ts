/**
 * API 응답 캐싱 유틸리티
 * 클라이언트 측에서 API 응답을 메모리에 캐싱하여 성능을 향상시킵니다.
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	expiresAt: number;
}

interface CacheOptions {
	/** 캐시 만료 시간 (밀리초) */
	ttl?: number;
	/** 캐시 키 생성 함수 */
	keyGenerator?: (...args: unknown[]) => string;
	/** 최대 캐시 엔트리 수 */
	maxEntries?: number;
}

/**
 * 메모리 기반 API 캐시 클래스
 */
class APICache<T = unknown> {
	private cache = new Map<string, CacheEntry<T>>();
	private readonly defaultTTL: number;
	private readonly maxEntries: number;

	constructor(options: CacheOptions = {}) {
		this.defaultTTL = options.ttl || 5 * 60 * 1000; // 기본 5분
		this.maxEntries = options.maxEntries || 100;
	}

	/**
	 * 캐시에서 데이터를 가져옵니다.
	 * @param key 캐시 키
	 * @returns 캐시된 데이터 또는 null
	 */
	get(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// 만료된 엔트리 제거
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * 캐시에 데이터를 저장합니다.
	 * @param key 캐시 키
	 * @param data 저장할 데이터
	 * @param ttl 캐시 만료 시간 (선택적)
	 */
	set(key: string, data: T, ttl?: number): void {
		const expirationTime = ttl || this.defaultTTL;
		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now(),
			expiresAt: Date.now() + expirationTime,
		};

		// 최대 엔트리 수 제한
		if (this.cache.size >= this.maxEntries) {
			this.evictOldest();
		}

		this.cache.set(key, entry);
	}

	/**
	 * 캐시에서 특정 키를 삭제합니다.
	 * @param key 삭제할 캐시 키
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * 전체 캐시를 초기화합니다.
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * 만료된 엔트리들을 정리합니다.
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiresAt) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * 가장 오래된 엔트리를 제거합니다.
	 */
	private evictOldest(): void {
		let oldestKey: string | null = null;
		let oldestTimestamp = Date.now();

		for (const [key, entry] of this.cache.entries()) {
			if (entry.timestamp < oldestTimestamp) {
				oldestTimestamp = entry.timestamp;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
		}
	}

	/**
	 * 캐시 통계를 반환합니다.
	 */
	getStats() {
		return {
			size: this.cache.size,
			maxEntries: this.maxEntries,
			defaultTTL: this.defaultTTL,
		};
	}
}

/**
 * 프롬프트 개선 API용 캐시 인스턴스
 */
export const promptCache = new APICache<string>({
	ttl: 30 * 60 * 1000, // 30분 캐시
	maxEntries: 50, // 최대 50개 프롬프트 캐시
});

/**
 * 캐시 키 생성 함수
 * @param prompt 원본 프롬프트
 * @param provider AI 제공자
 * @returns 캐시 키
 */
export function generateCacheKey(prompt: string, provider: string): string {
	// 프롬프트를 정규화하고 해시 생성
	const normalizedPrompt = prompt.trim().toLowerCase();
	return `${provider}:${btoa(normalizedPrompt).slice(0, 32)}`;
}

/**
 * 캐시된 API 호출 래퍼 함수
 * @param key 캐시 키
 * @param apiCall API 호출 함수
 * @param ttl 캐시 만료 시간 (선택적)
 * @returns 캐시된 데이터 또는 API 호출 결과
 */
export async function withCache<T>(
	key: string,
	apiCall: () => Promise<T>,
	ttl?: number
): Promise<T> {
	// 캐시에서 먼저 확인
	const cached = promptCache.get(key) as T | null;
	if (cached !== null) {
		console.log(`캐시 히트: ${key}`);
		return cached;
	}

	// 캐시 미스 - API 호출
	console.log(`캐시 미스: ${key}`);
	const result = await apiCall();

	// 결과를 캐시에 저장
	promptCache.set(key, result as string, ttl);

	return result;
}

/**
 * 캐시 정리 작업을 주기적으로 수행
 */
export function startCacheCleanup(
	intervalMs: number = 5 * 60 * 1000
): () => void {
	const interval = setInterval(() => {
		promptCache.cleanup();
		console.log("캐시 정리 완료:", promptCache.getStats());
	}, intervalMs);

	// 정리 작업 중단 함수 반환
	return () => clearInterval(interval);
}

/**
 * 브라우저에서만 자동 캐시 정리 시작
 */
if (typeof window !== "undefined") {
	startCacheCleanup();
}

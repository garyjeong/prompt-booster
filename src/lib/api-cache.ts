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
 * 유니코드 안전 base64 인코딩 함수
 * @param str 인코딩할 문자열
 * @returns base64 인코딩된 문자열
 */
function encodeToBase64(str: string): string {
	try {
		// 브라우저 환경에서는 TextEncoder 사용
		if (typeof TextEncoder !== "undefined") {
			const encoder = new TextEncoder();
			const data = encoder.encode(str);
			const base64 = btoa(String.fromCharCode(...data));
			return base64;
		}

		// Node.js 환경에서는 Buffer 사용
		if (typeof Buffer !== "undefined") {
			return Buffer.from(str, "utf8").toString("base64");
		}

		// 폴백: ASCII 범위 문자만 처리
		return btoa(str);
	} catch (error) {
		console.warn("Base64 인코딩 실패, 폴백 사용:", error);
		// 에러 발생 시 단순 해시 생성
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // 32bit 정수로 변환
		}
		return Math.abs(hash).toString(36);
	}
}

/**
 * 캐시 키 생성 함수
 * @param prompt 원본 프롬프트
 * @param provider AI 제공자 (또는 provider:targetModel 형태)
 * @returns 캐시 키
 */
export function generateCacheKey(prompt: string, provider: string): string {
	// 프롬프트를 정규화하고 해시 생성
	const normalizedPrompt = prompt.trim().toLowerCase();
	const encoded = encodeToBase64(normalizedPrompt);
	return `${provider}:${encoded.slice(0, 32)}`;
}

// 동시 요청 관리를 위한 pending 맵
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pendingRequests = new Map<string, Promise<any>>();

/**
 * 캐시된 API 호출 래퍼 함수 (동시성 제어 포함)
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

	// 동시 요청이 이미 진행 중인지 확인
	const existingRequest = pendingRequests.get(key);
	if (existingRequest) {
		console.log(`대기 중인 요청 사용: ${key}`);
		return await existingRequest;
	}

	// 새로운 API 호출 시작
	console.log(`캐시 미스: ${key}`);
	const requestPromise = apiCall();

	// 진행 중인 요청으로 등록
	pendingRequests.set(key, requestPromise);

	try {
		const result = await requestPromise;

		// 결과를 캐시에 저장
		promptCache.set(key, result as string, ttl);

		return result;
	} finally {
		// 요청 완료 후 pending 목록에서 제거
		pendingRequests.delete(key);
	}
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

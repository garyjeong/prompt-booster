/**
 * API Cache 유틸리티 함수 테스트
 */

import {
	promptCache,
	generateCacheKey,
	withCache,
	startCacheCleanup,
} from "@/lib/api-cache";

describe("API Cache Utilities", () => {
	beforeEach(() => {
		// 각 테스트 전에 캐시 초기화
		promptCache.clear();
		jest.clearAllMocks();
	});

	describe("generateCacheKey", () => {
		it("should generate consistent cache keys", () => {
			const prompt = "리액트에서 useState를 사용하는 방법을 알려줘";
			const provider = "openai";

			const key1 = generateCacheKey(prompt, provider);
			const key2 = generateCacheKey(prompt, provider);

			expect(key1).toBe(key2);
			expect(key1).toContain("openai:");
		});

		it("should generate different keys for different prompts", () => {
			const prompt1 = "리액트에서 useState를 사용하는 방법";
			const prompt2 = "뷰에서 reactive를 사용하는 방법";
			const provider = "openai";

			const key1 = generateCacheKey(prompt1, provider);
			const key2 = generateCacheKey(prompt2, provider);

			expect(key1).not.toBe(key2);
		});

		it("should generate different keys for different providers", () => {
			const prompt = "리액트에서 useState를 사용하는 방법";

			const key1 = generateCacheKey(prompt, "openai");
			const key2 = generateCacheKey(prompt, "gemini");

			expect(key1).not.toBe(key2);
			expect(key1).toContain("openai:");
			expect(key2).toContain("gemini:");
		});

		it("should normalize prompts (case insensitive)", () => {
			const prompt1 = "React에서 useState 사용법";
			const prompt2 = "react에서 usestate 사용법";
			const provider = "openai";

			const key1 = generateCacheKey(prompt1, provider);
			const key2 = generateCacheKey(prompt2, provider);

			expect(key1).toBe(key2);
		});

		it("should handle empty prompts", () => {
			const key = generateCacheKey("", "openai");

			expect(key).toContain("openai:");
			expect(typeof key).toBe("string");
		});
	});

	describe("promptCache", () => {
		it("should store and retrieve cached data", () => {
			const key = "test-key";
			const data = "개선된 프롬프트 결과";

			promptCache.set(key, data);
			const result = promptCache.get(key);

			expect(result).toBe(data);
		});

		it("should return null for non-existent keys", () => {
			const result = promptCache.get("non-existent-key");

			expect(result).toBeNull();
		});

		it("should expire cached data after TTL", async () => {
			const key = "expire-test-key";
			const data = "임시 데이터";
			const shortTTL = 100; // 100ms

			promptCache.set(key, data, shortTTL);

			// 즉시 조회하면 데이터가 있어야 함
			expect(promptCache.get(key)).toBe(data);

			// TTL 후 조회하면 null이어야 함
			await new Promise((resolve) => setTimeout(resolve, 150));
			expect(promptCache.get(key)).toBeNull();
		});

		it("should delete specific cache entries", () => {
			const key = "delete-test-key";
			const data = "삭제될 데이터";

			promptCache.set(key, data);
			expect(promptCache.get(key)).toBe(data);

			const deleted = promptCache.delete(key);
			expect(deleted).toBe(true);
			expect(promptCache.get(key)).toBeNull();
		});

		it("should clear all cache entries", () => {
			promptCache.set("key1", "data1");
			promptCache.set("key2", "data2");

			promptCache.clear();

			expect(promptCache.get("key1")).toBeNull();
			expect(promptCache.get("key2")).toBeNull();
		});

		it("should clean up expired entries", async () => {
			const key1 = "cleanup-test-1";
			const key2 = "cleanup-test-2";
			const shortTTL = 50;
			const longTTL = 5000;

			promptCache.set(key1, "expire-soon", shortTTL);
			promptCache.set(key2, "expire-later", longTTL);

			// 짧은 TTL 후 cleanup 실행
			await new Promise((resolve) => setTimeout(resolve, 100));
			promptCache.cleanup();

			expect(promptCache.get(key1)).toBeNull();
			expect(promptCache.get(key2)).toBe("expire-later");
		});

		it("should get cache statistics", () => {
			promptCache.set("stats-key-1", "data1");
			promptCache.set("stats-key-2", "data2");

			const stats = promptCache.getStats();

			expect(stats.size).toBe(2);
			expect(stats.maxEntries).toBe(50); // 설정된 최대값
			expect(typeof stats.defaultTTL).toBe("number");
		});
	});

	describe("withCache", () => {
		it("should cache function results", async () => {
			const key = "with-cache-test";
			const expectedResult = "캐시된 결과";
			const mockApiCall = jest.fn().mockResolvedValue(expectedResult);

			const result = await withCache(key, mockApiCall);

			expect(result).toBe(expectedResult);
			expect(mockApiCall).toHaveBeenCalledTimes(1);
		});

		it("should return cached result on second call", async () => {
			const key = "cache-hit-test";
			const expectedResult = "캐시 히트 결과";
			const mockApiCall = jest.fn().mockResolvedValue(expectedResult);

			// 첫 번째 호출
			const result1 = await withCache(key, mockApiCall);

			// 두 번째 호출 (캐시에서 반환되어야 함)
			const result2 = await withCache(key, mockApiCall);

			expect(result1).toBe(expectedResult);
			expect(result2).toBe(expectedResult);
			expect(mockApiCall).toHaveBeenCalledTimes(1); // API는 한 번만 호출
		});

		it("should handle API call failures", async () => {
			const key = "error-test";
			const mockApiCall = jest.fn().mockRejectedValue(new Error("API 오류"));

			await expect(withCache(key, mockApiCall)).rejects.toThrow("API 오류");
			expect(mockApiCall).toHaveBeenCalledTimes(1);
		});

		it("should use custom TTL when provided", async () => {
			const key = "custom-ttl-test";
			const expectedResult = "커스텀 TTL 결과";
			const mockApiCall = jest.fn().mockResolvedValue(expectedResult);
			const customTTL = 100;

			await withCache(key, mockApiCall, customTTL);

			expect(promptCache.get(key)).toBe(expectedResult);

			// 커스텀 TTL 후 만료 확인
			await new Promise((resolve) => setTimeout(resolve, 150));
			expect(promptCache.get(key)).toBeNull();
		});

		it("should handle different data types", async () => {
			const objectData = { message: "객체 데이터", count: 123 };
			const mockApiCall = jest.fn().mockResolvedValue(objectData);

			const result = await withCache("object-test", mockApiCall);

			expect(result).toEqual(objectData);
		});
	});

	describe("startCacheCleanup", () => {
		it("should return a cleanup stop function", () => {
			const stopCleanup = startCacheCleanup(100); // 100ms 간격

			expect(typeof stopCleanup).toBe("function");

			// 정리 함수 호출하여 타이머 중지
			stopCleanup();
		});

		it("should clean up expired entries periodically", async () => {
			const shortTTL = 50;
			promptCache.set("periodic-test", "expire-soon", shortTTL);

			const stopCleanup = startCacheCleanup(100); // 100ms 간격으로 정리

			// 초기에는 데이터가 있어야 함
			expect(promptCache.get("periodic-test")).toBe("expire-soon");

			// TTL 후 자동 정리 대기
			await new Promise((resolve) => setTimeout(resolve, 200));

			// 자동 정리로 인해 데이터가 없어야 함
			expect(promptCache.get("periodic-test")).toBeNull();

			stopCleanup();
		}, 500);
	});

	describe("Real-world scenarios", () => {
		it("should handle concurrent cache operations", async () => {
			const key = "concurrent-test";
			const mockApiCall = jest.fn().mockResolvedValue("동시 접근 결과");

			// 동시에 여러 요청 실행
			const promises = Array(5)
				.fill(null)
				.map(() => withCache(key, mockApiCall));
			const results = await Promise.all(promises);

			// 모든 결과가 동일해야 함
			expect(results.every((result) => result === "동시 접근 결과")).toBe(true);

			// API는 한 번만 호출되어야 함 (첫 번째 요청만)
			expect(mockApiCall).toHaveBeenCalledTimes(1);
		});

		it("should handle cache key collisions correctly", () => {
			const data1 = "첫 번째 데이터";
			const data2 = "두 번째 데이터";

			promptCache.set("collision-key", data1);
			promptCache.set("collision-key", data2); // 같은 키로 덮어쓰기

			expect(promptCache.get("collision-key")).toBe(data2);
		});

		it("should maintain cache performance with many entries", () => {
			const startTime = Date.now();

			// 많은 엔트리 추가
			for (let i = 0; i < 100; i++) {
				promptCache.set(`perf-test-${i}`, `data-${i}`);
			}

			// 조회 성능 테스트
			for (let i = 0; i < 100; i++) {
				const result = promptCache.get(`perf-test-${i}`);
				expect(result).toBe(`data-${i}`);
			}

			const endTime = Date.now();
			const duration = endTime - startTime;

			// 100개 엔트리 조회가 1초 이내에 완료되어야 함
			expect(duration).toBeLessThan(1000);
		});
	});
});

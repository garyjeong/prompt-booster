/**
 * 공통 유틸리티 함수들
 * - 시간 관련 함수
 * - 문자열 처리 함수
 * - 일반적인 헬퍼 함수들
 */

/**
 * 현재 시간을 ISO 문자열로 반환합니다.
 * @returns ISO 형식의 현재 시간 문자열
 */
export function getCurrentTimestamp(): string {
	return new Date().toISOString();
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다.
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function getTodayDateString(): string {
	return new Date().toISOString().split("T")[0];
}

/**
 * 문자열이 비어있거나 공백만 있는지 확인합니다.
 * @param str 확인할 문자열
 * @returns 비어있거나 공백만 있으면 true
 */
export function isEmpty(str: string | null | undefined): boolean {
	return !str || str.trim().length === 0;
}

/**
 * 문자열을 안전하게 트림합니다.
 * @param str 트림할 문자열
 * @returns 트림된 문자열 또는 빈 문자열
 */
export function safeTrim(str: string | null | undefined): string {
	return str?.trim() || "";
}

/**
 * 두 문자열을 대소문자 구분 없이 비교합니다.
 * @param a 첫 번째 문자열
 * @param b 두 번째 문자열
 * @returns 같으면 true
 */
export function equalsIgnoreCase(a: string, b: string): boolean {
	return a.toLowerCase() === b.toLowerCase();
}

/**
 * 밀리초를 사람이 읽기 쉬운 형태로 변환합니다.
 * @param ms 밀리초
 * @returns 형식화된 시간 문자열
 */
export function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	if (ms < 3600000) return `${(ms / 60000).toFixed(1)}분`;
	return `${(ms / 3600000).toFixed(1)}시간`;
}

/**
 * 객체에서 undefined 값을 제거합니다.
 * @param obj 처리할 객체
 * @returns undefined 값이 제거된 새 객체
 */
export function removeUndefined<T extends Record<string, unknown>>(
	obj: T
): Partial<T> {
	const result: Partial<T> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined) {
			result[key as keyof T] = value as T[keyof T];
		}
	}
	return result;
}

/**
 * 깊은 복사를 수행합니다.
 * @param obj 복사할 객체
 * @returns 깊은 복사된 객체
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as T;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => deepClone(item)) as T;
	}

	const cloned = {} as T;
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			cloned[key] = deepClone(obj[key]);
		}
	}

	return cloned;
}

/**
 * 배열에서 중복된 요소를 제거합니다.
 * @param array 중복을 제거할 배열
 * @param keyFn 고유성을 판단할 키 함수 (선택적)
 * @returns 중복이 제거된 새 배열
 */
export function unique<T>(array: T[], keyFn?: (item: T) => unknown): T[] {
	if (!keyFn) {
		return [...new Set(array)];
	}

	const seen = new Set();
	return array.filter((item) => {
		const key = keyFn(item);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

/**
 * 지연 실행을 위한 sleep 함수
 * @param ms 지연할 밀리초
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 함수의 실행을 지연시키는 debounce 함수
 * @param func 지연시킬 함수
 * @param delay 지연 시간 (밀리초)
 * @returns debounced 함수
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

/**
 * 함수의 실행 빈도를 제한하는 throttle 함수
 * @param func 제한할 함수
 * @param limit 제한 간격 (밀리초)
 * @returns throttled 함수
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

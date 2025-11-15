/**
 * API 응답 공통 타입
 */

/** API 에러 응답 */
export interface APIError {
	/** 에러 메시지 */
	error: string;
	/** 에러 코드 */
	code: string;
	/** 상세 정보 (옵션) */
	details?: string;
}

/** API 응답 래퍼 */
export type APIResponse<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: APIError;
	  };

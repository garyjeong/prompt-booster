/**
 * API 응답 공통 타입
 */

import { z } from 'zod';

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

/**
 * Zod 스키마: API 에러 응답
 */
export const APIErrorSchema = z.object({
	error: z.string(),
	code: z.string(),
	details: z.string().optional(),
});

/**
 * Zod 스키마: API 응답 래퍼 (성공)
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
	return z.object({
		success: z.literal(true),
		data: dataSchema,
	});
}

/**
 * Zod 스키마: API 응답 래퍼 (실패)
 */
export const ErrorResponseSchema = z.object({
	success: z.literal(false),
	error: APIErrorSchema,
});

/**
 * Zod 스키마: API 응답 래퍼 (성공 또는 실패)
 */
export function createAPIResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
	return z.union([
		createSuccessResponseSchema(dataSchema),
		ErrorResponseSchema,
	]);
}

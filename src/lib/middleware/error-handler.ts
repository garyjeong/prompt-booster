/**
 * 에러 핸들러 미들웨어
 * API 라우트에서 일관된 에러 응답을 제공
 */

import { NextResponse } from 'next/server';
import { AppError } from '../errors/AppError';
import { isDevelopment } from '@/config/env';
import type { APIError } from '@/types/api';

/**
 * 에러를 API 응답 형식으로 변환
 */
export function handleError(error: unknown): NextResponse {
	// AppError 인스턴스인 경우
	if (error instanceof AppError) {
		const apiError: APIError = {
			error: error.message,
			code: error.code,
			details: isDevelopment() ? error.stack : undefined,
		};

		return NextResponse.json(
			{
				success: false,
				error: apiError,
			},
			{ status: error.statusCode }
		);
	}

	// 일반 Error 인스턴스인 경우
	if (error instanceof Error) {
		const apiError: APIError = {
			error: error.message,
			code: 'INTERNAL_ERROR',
			details: isDevelopment() ? error.stack : undefined,
		};

		return NextResponse.json(
			{
				success: false,
				error: apiError,
			},
			{ status: 500 }
		);
	}

	// 알 수 없는 에러
	const apiError: APIError = {
		error: '알 수 없는 오류가 발생했습니다.',
		code: 'INTERNAL_ERROR',
	};

	return NextResponse.json(
		{
			success: false,
			error: apiError,
		},
		{ status: 500 }
	);
}

/**
 * 에러 핸들러 래퍼
 * API 핸들러 함수를 감싸서 에러를 자동으로 처리
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<NextResponse>>(
	handler: T
): T {
	return (async (...args: Parameters<T>) => {
		try {
			return await handler(...args);
		} catch (error) {
			console.error('API 에러:', error);
			return handleError(error);
		}
	}) as T;
}


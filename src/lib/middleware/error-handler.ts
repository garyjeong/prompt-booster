/**
 * 에러 핸들러 미들웨어
 * API 라우트에서 일관된 에러 응답을 제공
 */

import { NextResponse } from 'next/server';
import { AppError } from '../errors/AppError';
import { isDevelopment } from '@/config/env';
import type { APIError } from '@/types/api';

/**
 * 사용자 친화적인 에러 메시지 변환
 */
function getUserFriendlyMessage(error: Error): string {
	const message = error.message;

	// Gemini API 관련 에러
	if (message.includes('GEMINI_API_KEY') || message.includes('API key')) {
		return 'AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
	}

	// 네트워크 관련 에러
	if (message.includes('fetch') || message.includes('network') || message.includes('ECONNREFUSED')) {
		return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
	}

	// 타임아웃 에러
	if (message.includes('timeout') || message.includes('TIMEOUT')) {
		return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
	}

	// 인증 관련 에러
	if (message.includes('unauthorized') || message.includes('Unauthorized')) {
		return '인증이 필요합니다. 로그인 후 다시 시도해주세요.';
	}

	// 검증 에러는 그대로 표시
	if (message.includes('필요') || message.includes('필수')) {
		return message;
	}

	// 기타 에러는 일반적인 메시지
	return '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

/**
 * 에러를 API 응답 형식으로 변환
 */
export function handleError(error: unknown): NextResponse {
	// AppError 인스턴스인 경우
	if (error instanceof AppError) {
		const userMessage = getUserFriendlyMessage(error);
		const apiError: APIError = {
			error: userMessage,
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
		const userMessage = getUserFriendlyMessage(error);
		const apiError: APIError = {
			error: userMessage,
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


/**
 * 에러 핸들러 테스트
 */

import { handleError, withErrorHandler } from '@/lib/middleware/error-handler';
import { ValidationError, NotFoundError, UnauthorizedError } from '@/lib/errors';
import { isDevelopment } from '@/config/env';
import { NextResponse } from 'next/server';

// 환경 변수 모킹
jest.mock('@/config/env', () => ({
	isDevelopment: jest.fn(),
}));

describe('handleError', () => {
	it('ValidationError를 처리해야 함', () => {
		const error = new ValidationError('유효하지 않은 입력입니다.');

		const response = handleError(error);
		const json = response as unknown as { json: () => Promise<any> };

		return json.json().then((data) => {
			expect(data.success).toBe(false);
			expect(data.error.error).toBe('유효하지 않은 입력입니다.');
			expect(data.error.code).toBe('VALIDATION_ERROR');
		});
	});

	it('NotFoundError를 처리해야 함', () => {
		const error = new NotFoundError('리소스', 'id-1');

		const response = handleError(error);
		const json = response as unknown as { json: () => Promise<any> };

		return json.json().then((data) => {
			expect(data.success).toBe(false);
			expect(data.error.code).toBe('NOT_FOUND');
		});
	});

	it('UnauthorizedError를 처리해야 함', () => {
		const error = new UnauthorizedError();

		const response = handleError(error);
		const json = response as unknown as { json: () => Promise<any> };

		return json.json().then((data) => {
			expect(data.success).toBe(false);
			expect(data.error.code).toBe('UNAUTHORIZED');
		});
	});

	it('일반 Error를 처리해야 함', () => {
		const error = new Error('일반 에러');

		const response = handleError(error);
		const json = response as unknown as { json: () => Promise<any> };

		return json.json().then((data) => {
			expect(data.success).toBe(false);
			expect(data.error.code).toBe('INTERNAL_ERROR');
		});
	});

	it('알 수 없는 에러를 처리해야 함', () => {
		const error = { message: '알 수 없는 에러' };

		const response = handleError(error);
		const json = response as unknown as { json: () => Promise<any> };

		return json.json().then((data) => {
			expect(data.success).toBe(false);
			expect(data.error.error).toBe('알 수 없는 오류가 발생했습니다.');
		});
	});

	it('개발 환경에서는 stack trace를 포함해야 함', () => {
		(isDevelopment as jest.Mock).mockReturnValue(true);

		const error = new Error('테스트 에러');
		error.stack = 'Error: 테스트 에러\n    at test.js:1:1';

		const response = handleError(error);
		const json = response as unknown as { json: () => Promise<any> };

		return json.json().then((data) => {
			expect(data.error.details).toBeDefined();
			expect(data.error.details).toContain('테스트 에러');
		});
	});

	it('프로덕션 환경에서는 stack trace를 포함하지 않아야 함', () => {
		(isDevelopment as jest.Mock).mockReturnValue(false);

		const error = new Error('테스트 에러');
		error.stack = 'Error: 테스트 에러\n    at test.js:1:1';

		const response = handleError(error);
		const json = response as unknown as { json: () => Promise<any> };

		return json.json().then((data) => {
			expect(data.error.details).toBeUndefined();
		});
	});

	it('AppError의 모든 에러 코드를 처리해야 함', () => {
		const validationError = new ValidationError('검증 실패');
		const notFoundError = new NotFoundError('리소스');
		const unauthorizedError = new UnauthorizedError();

		const validationResponse = handleError(validationError);
		const notFoundResponse = handleError(notFoundError);
		const unauthorizedResponse = handleError(unauthorizedError);

		expect(validationResponse.status).toBe(400);
		expect(notFoundResponse.status).toBe(404);
		expect(unauthorizedResponse.status).toBe(401);
	});

	it('getUserFriendlyMessage의 모든 분기를 테스트해야 함', () => {
		(isDevelopment as jest.Mock).mockReturnValue(false);

		// OpenAI API 에러
		const openaiError = new Error('OPENAI_API_KEY is missing');
		const openaiResponse = handleError(openaiError);
		const openaiJson = openaiResponse as unknown as { json: () => Promise<any> };
		openaiJson.json().then((data) => {
			expect(data.error.error).toContain('AI 서비스에 연결할 수 없습니다');
		});

		// 네트워크 에러
		const networkError = new Error('fetch failed: ECONNREFUSED');
		const networkResponse = handleError(networkError);
		const networkJson = networkResponse as unknown as { json: () => Promise<any> };
		networkJson.json().then((data) => {
			expect(data.error.error).toContain('네트워크 연결');
		});

		// 타임아웃 에러
		const timeoutError = new Error('Request timeout');
		const timeoutResponse = handleError(timeoutError);
		const timeoutJson = timeoutResponse as unknown as { json: () => Promise<any> };
		timeoutJson.json().then((data) => {
			expect(data.error.error).toContain('요청 시간이 초과');
		});

		// 인증 에러
		const authError = new Error('Unauthorized access');
		const authResponse = handleError(authError);
		const authJson = authResponse as unknown as { json: () => Promise<any> };
		authJson.json().then((data) => {
			expect(data.error.error).toContain('인증이 필요합니다');
		});

		// 검증 에러 (필요/필수 포함)
		const validationMsgError = new Error('필수 항목이 필요합니다');
		const validationMsgResponse = handleError(validationMsgError);
		const validationMsgJson = validationMsgResponse as unknown as { json: () => Promise<any> };
		validationMsgJson.json().then((data) => {
			expect(data.error.error).toBe('필수 항목이 필요합니다');
		});
	});

	describe('withErrorHandler', () => {
		it('정상 실행 시 결과를 반환해야 함', async () => {
			const handler = jest.fn().mockResolvedValue(
				NextResponse.json({ success: true, data: 'test' })
			);

			const wrappedHandler = withErrorHandler(handler);
			const result = await wrappedHandler();

			expect(handler).toHaveBeenCalled();
			const json = await result.json();
			expect(json.success).toBe(true);
			expect(json.data).toBe('test');
		});

		it('에러 발생 시 handleError를 호출해야 함', async () => {
			const error = new ValidationError('테스트 에러');
			const handler = jest.fn().mockRejectedValue(error);

			const wrappedHandler = withErrorHandler(handler);
			const result = await wrappedHandler();

			expect(handler).toHaveBeenCalled();
			const json = await result.json();
			expect(json.success).toBe(false);
			expect(json.error.code).toBe('VALIDATION_ERROR');
		});

		it('인자를 전달할 수 있어야 함', async () => {
			const handler = jest.fn().mockImplementation((arg1, arg2) => {
				return Promise.resolve(NextResponse.json({ success: true, data: { arg1, arg2 } }));
			});

			const wrappedHandler = withErrorHandler(handler);
			const result = await wrappedHandler('test1', 'test2');

			expect(handler).toHaveBeenCalledWith('test1', 'test2');
			const json = await result.json();
			expect(json.data.arg1).toBe('test1');
			expect(json.data.arg2).toBe('test2');
		});
	});
});


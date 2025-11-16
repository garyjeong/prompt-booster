/**
 * 커스텀 에러 클래스 테스트
 */

import {
	AppError,
	ValidationError,
	NotFoundError,
	UnauthorizedError,
	ForbiddenError,
} from '@/lib/errors';

describe('Custom Errors', () => {
	describe('AppError', () => {
		it('기본 에러를 생성해야 함', () => {
			const error = new AppError('테스트 에러');

			expect(error.message).toBe('테스트 에러');
			expect(error.code).toBe('INTERNAL_ERROR');
			expect(error.statusCode).toBe(500);
			expect(error.isOperational).toBe(true);
		});

		it('커스텀 코드와 상태 코드를 설정할 수 있어야 함', () => {
			const error = new AppError('테스트 에러', 'CUSTOM_CODE', 400);

			expect(error.code).toBe('CUSTOM_CODE');
			expect(error.statusCode).toBe(400);
		});
	});

	describe('ValidationError', () => {
		it('검증 에러를 생성해야 함', () => {
			const error = new ValidationError('유효하지 않은 입력');

			expect(error.message).toBe('유효하지 않은 입력');
			expect(error.code).toBe('VALIDATION_ERROR');
			expect(error.statusCode).toBe(400);
		});

		it('필드별 에러를 포함할 수 있어야 함', () => {
			const fields = {
				email: ['이메일 형식이 올바르지 않습니다'],
				password: ['비밀번호는 8자 이상이어야 합니다'],
			};

			const error = new ValidationError('검증 실패', fields);

			expect(error.fields).toEqual(fields);
		});
	});

	describe('NotFoundError', () => {
		it('리소스를 찾을 수 없음 에러를 생성해야 함', () => {
			const error = new NotFoundError('문서', 'doc-1');

			expect(error.message).toContain('문서');
			expect(error.code).toBe('NOT_FOUND');
			expect(error.statusCode).toBe(404);
		});

		it('ID 없이 에러를 생성할 수 있어야 함', () => {
			const error = new NotFoundError('리소스');

			expect(error.message).toContain('리소스');
		});
	});

	describe('UnauthorizedError', () => {
		it('인증 에러를 생성해야 함', () => {
			const error = new UnauthorizedError();

			expect(error.code).toBe('UNAUTHORIZED');
			expect(error.statusCode).toBe(401);
		});

		it('커스텀 메시지를 포함할 수 있어야 함', () => {
			const error = new UnauthorizedError('접근 권한이 없습니다');

			expect(error.message).toBe('접근 권한이 없습니다');
		});
	});

	describe('ForbiddenError', () => {
		it('권한 없음 에러를 생성해야 함', () => {
			const error = new ForbiddenError();

			expect(error.code).toBe('FORBIDDEN');
			expect(error.statusCode).toBe(403);
		});

		it('커스텀 메시지를 포함할 수 있어야 함', () => {
			const error = new ForbiddenError('이 작업을 수행할 권한이 없습니다');

			expect(error.message).toBe('이 작업을 수행할 권한이 없습니다');
		});
	});
});


/**
 * 애플리케이션 기본 에러 클래스
 * 모든 커스텀 에러의 기본 클래스
 */

export class AppError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		code: string = 'INTERNAL_ERROR',
		statusCode: number = 500,
		isOperational: boolean = true
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, this.constructor);
	}
}


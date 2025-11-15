/**
 * 유효성 검증 에러
 * 요청 데이터가 유효하지 않을 때 발생
 */

import { AppError } from './AppError';

export class ValidationError extends AppError {
	public readonly fields?: Record<string, string[]>;

	constructor(
		message: string,
		fields?: Record<string, string[]>,
		code: string = 'VALIDATION_ERROR'
	) {
		super(message, code, 400);
		this.fields = fields;
	}
}


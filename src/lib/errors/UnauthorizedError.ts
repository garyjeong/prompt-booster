/**
 * 인증이 필요하거나 인증에 실패했을 때 발생하는 에러
 */

import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
	constructor(message: string = '인증이 필요합니다.') {
		super(message, 'UNAUTHORIZED', 401);
	}
}


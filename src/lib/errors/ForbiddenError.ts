/**
 * 권한이 없을 때 발생하는 에러
 */

import { AppError } from './AppError';

export class ForbiddenError extends AppError {
	constructor(message: string = '이 작업을 수행할 권한이 없습니다.') {
		super(message, 'FORBIDDEN', 403);
	}
}


/**
 * 리소스를 찾을 수 없을 때 발생하는 에러
 */

import { AppError } from './AppError';

export class NotFoundError extends AppError {
	constructor(resource: string, identifier?: string) {
		const message = identifier
			? `${resource}를 찾을 수 없습니다. (ID: ${identifier})`
			: `${resource}를 찾을 수 없습니다.`;
		super(message, 'NOT_FOUND', 404);
	}
}


/**
 * 환경 변수 초기화 및 검증
 * 앱 시작 시 한 번만 실행
 */

import { validateRequiredEnv, isProduction } from '@/config/env';

let isInitialized = false;

/**
 * 환경 변수 초기화 및 검증
 * 앱 시작 시 호출
 * 빌드 시에는 실행하지 않음
 */
export function initializeEnv(): void {
	// 빌드 시에는 실행하지 않음
	if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
		return;
	}

	if (isInitialized) {
		return;
	}

	const result = validateRequiredEnv(isProduction());

	if (!result.isValid) {
		const errorMessage = `환경 변수 설정 오류:\n${result.errors.join('\n')}`;
		
		if (isProduction()) {
			// 프로덕션에서는 에러 발생
			throw new Error(errorMessage);
		} else {
			// 개발 환경에서는 경고만 출력
			console.warn('⚠️ 환경 변수 경고:', errorMessage);
		}
	}

	if (result.warnings.length > 0) {
		console.warn('⚠️ 환경 변수 경고:\n', result.warnings.join('\n'));
	}

	isInitialized = true;
}


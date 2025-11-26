/**
 * 환경 변수 관리 및 검증
 */

/**
 * 환경 변수 타입 정의
 */
export interface EnvConfig {
	nodeEnv: 'development' | 'production' | 'test';
	openaiApiKey?: string;
	googleClientId?: string;
	googleClientSecret?: string;
	nextAuthSecret?: string;
	nextAuthUrl?: string;
	databaseUrl?: string;
}

/**
 * 환경 변수 로드 및 검증
 */
export function getEnvConfig(): EnvConfig {
	const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

	return {
		nodeEnv,
		openaiApiKey: process.env.OPENAI_API_KEY,
		googleClientId: process.env.GOOGLE_CLIENT_ID,
		googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
		nextAuthSecret: process.env.NEXTAUTH_SECRET,
		nextAuthUrl: process.env.NEXTAUTH_URL,
		databaseUrl: process.env.DATABASE_URL,
	};
}

/**
 * 환경 변수 검증 결과
 */
export interface EnvValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * 필수 환경 변수 검증
 * @param strict 프로덕션 환경에서만 검증할지 여부 (기본값: false)
 * @returns 검증 결과
 */
export function validateRequiredEnv(strict: boolean = false): EnvValidationResult {
	const config = getEnvConfig();
	const errors: string[] = [];
	const warnings: string[] = [];

	// 항상 검증해야 하는 변수
	if (!config.databaseUrl) {
		errors.push('DATABASE_URL이 설정되지 않았습니다.');
	}

	// 프로덕션 환경 또는 strict 모드일 때 필수
	const shouldValidateStrict = config.nodeEnv === 'production' || strict;

	if (shouldValidateStrict) {
		if (!config.nextAuthSecret) {
			errors.push('NEXTAUTH_SECRET이 설정되지 않았습니다.');
		}
		if (!config.openaiApiKey) {
			errors.push('OPENAI_API_KEY가 설정되지 않았습니다.');
		}
		if (!config.nextAuthUrl) {
			warnings.push('NEXTAUTH_URL이 설정되지 않았습니다. NextAuth 콜백이 제대로 작동하지 않을 수 있습니다.');
		}
	} else {
		// 개발 환경에서는 경고만
		if (!config.nextAuthSecret) {
			warnings.push('NEXTAUTH_SECRET이 설정되지 않았습니다. (개발 환경에서는 선택사항)');
		}
		if (!config.openaiApiKey) {
			warnings.push('OPENAI_API_KEY가 설정되지 않았습니다. 채팅 기능이 작동하지 않습니다.');
		}
	}

	// Google OAuth는 선택사항이지만 설정되어 있으면 둘 다 있어야 함
	if (config.googleClientId && !config.googleClientSecret) {
		warnings.push('GOOGLE_CLIENT_ID는 설정되었지만 GOOGLE_CLIENT_SECRET이 없습니다.');
	}
	if (config.googleClientSecret && !config.googleClientId) {
		warnings.push('GOOGLE_CLIENT_SECRET은 설정되었지만 GOOGLE_CLIENT_ID가 없습니다.');
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * 필수 환경 변수 검증 (에러 발생)
 * @throws Error 필수 환경 변수가 없을 때
 */
export function validateRequiredEnvOrThrow(): void {
	const result = validateRequiredEnv(true);
	if (!result.isValid) {
		throw new Error(`환경 변수 설정 오류:\n${result.errors.join('\n')}`);
	}
}

/**
 * 개발 환경 여부
 */
export function isDevelopment(): boolean {
	return getEnvConfig().nodeEnv === 'development';
}

/**
 * 프로덕션 환경 여부
 */
export function isProduction(): boolean {
	return getEnvConfig().nodeEnv === 'production';
}

/**
 * 테스트 환경 여부
 */
export function isTest(): boolean {
	return getEnvConfig().nodeEnv === 'test';
}


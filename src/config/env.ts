/**
 * 환경 변수 관리 및 검증
 */

/**
 * 환경 변수 타입 정의
 */
export interface EnvConfig {
	nodeEnv: 'development' | 'production' | 'test';
	geminiApiKey?: string;
	googleClientId?: string;
	googleClientSecret?: string;
	nextAuthSecret?: string;
	databaseUrl?: string;
}

/**
 * 환경 변수 로드 및 검증
 */
export function getEnvConfig(): EnvConfig {
	const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

	return {
		nodeEnv,
		geminiApiKey: process.env.GEMINI_API_KEY,
		googleClientId: process.env.GOOGLE_CLIENT_ID,
		googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
		nextAuthSecret: process.env.NEXTAUTH_SECRET,
		databaseUrl: process.env.DATABASE_URL,
	};
}

/**
 * 필수 환경 변수 검증
 * @throws Error 필수 환경 변수가 없을 때
 */
export function validateRequiredEnv(): void {
	const config = getEnvConfig();
	const errors: string[] = [];

	if (!config.databaseUrl) {
		errors.push('DATABASE_URL이 설정되지 않았습니다.');
	}

	if (config.nodeEnv === 'production') {
		if (!config.nextAuthSecret) {
			errors.push('NEXTAUTH_SECRET이 설정되지 않았습니다.');
		}
		if (!config.geminiApiKey) {
			errors.push('GEMINI_API_KEY가 설정되지 않았습니다.');
		}
	}

	if (errors.length > 0) {
		throw new Error(`환경 변수 설정 오류:\n${errors.join('\n')}`);
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


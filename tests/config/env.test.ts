/**
 * 환경 변수 관리 테스트
 */

import { getEnvConfig, validateRequiredEnv, isDevelopment, isProduction } from '@/config/env';

describe('Env Config', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe('getEnvConfig', () => {
		it('환경 변수를 올바르게 로드해야 함', () => {
			process.env.GEMINI_API_KEY = 'test-key';
			process.env.DATABASE_URL = 'postgresql://test';
			process.env.NEXTAUTH_SECRET = 'test-secret';
			process.env.NEXTAUTH_URL = 'http://localhost:3000';

			const config = getEnvConfig();

			expect(config.geminiApiKey).toBe('test-key');
			expect(config.databaseUrl).toBe('postgresql://test');
			expect(config.nextAuthSecret).toBe('test-secret');
			expect(config.nextAuthUrl).toBe('http://localhost:3000');
		});

		it('환경 변수가 없으면 undefined를 반환해야 함', () => {
			delete process.env.GEMINI_API_KEY;

			const config = getEnvConfig();

			expect(config.geminiApiKey).toBeUndefined();
		});
	});

	describe('validateRequiredEnv', () => {
		it('프로덕션 환경에서 필수 변수를 검증해야 함', () => {
			process.env.NODE_ENV = 'production';
			process.env.DATABASE_URL = 'postgresql://test';
			process.env.NEXTAUTH_SECRET = 'test-secret';
			process.env.GEMINI_API_KEY = 'test-key';

			const result = validateRequiredEnv(true);

			expect(result.isValid).toBe(true);
			expect(result.errors.length).toBe(0);
		});

		it('필수 변수가 없으면 에러를 반환해야 함', () => {
			process.env.NODE_ENV = 'production';
			delete process.env.DATABASE_URL;
			delete process.env.NEXTAUTH_SECRET;
			delete process.env.GEMINI_API_KEY;

			const result = validateRequiredEnv(true);

			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('개발 환경에서는 경고만 표시해야 함', () => {
			process.env.NODE_ENV = 'development';
			delete process.env.GEMINI_API_KEY;

			const result = validateRequiredEnv(false);

			expect(result.isValid).toBe(true);
			expect(result.warnings.length).toBeGreaterThan(0);
		});
	});

	describe('isDevelopment', () => {
		it('개발 환경을 올바르게 감지해야 함', () => {
			process.env.NODE_ENV = 'development';

			expect(isDevelopment()).toBe(true);
		});

		it('프로덕션 환경에서는 false를 반환해야 함', () => {
			process.env.NODE_ENV = 'production';

			expect(isDevelopment()).toBe(false);
		});
	});

	describe('isProduction', () => {
		it('프로덕션 환경을 올바르게 감지해야 함', () => {
			process.env.NODE_ENV = 'production';

			expect(isProduction()).toBe(true);
		});

		it('개발 환경에서는 false를 반환해야 함', () => {
			process.env.NODE_ENV = 'development';

			expect(isProduction()).toBe(false);
		});
	});
});


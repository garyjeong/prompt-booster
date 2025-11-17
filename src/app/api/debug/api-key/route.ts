/**
 * 개발 환경 전용 API 키 조회 엔드포인트
 * 프로덕션 환경에서는 404 반환
 */

import { NextResponse } from 'next/server';
import { getEnvConfig, isDevelopment } from '@/config/env';

export async function GET() {
	// 프로덕션 환경에서는 접근 불가
	if (!isDevelopment()) {
		return NextResponse.json(
			{ success: false, error: 'Not found' },
			{ status: 404 }
		);
	}

	// 디버깅: 환경 변수 소스 확인
	const rawEnv = process.env.OPENAI_API_KEY;
	const config = getEnvConfig();
	const apiKey = config.openaiApiKey;

	// 디버깅 정보 포함
	return NextResponse.json({
		success: true,
		apiKey,
		debug: {
			rawEnvKey: rawEnv ? `${rawEnv.substring(0, 20)}...${rawEnv.substring(rawEnv.length - 20)}` : null,
			configKey: apiKey ? `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 20)}` : null,
			rawEnvLength: rawEnv?.length || 0,
			configKeyLength: apiKey?.length || 0,
			keysMatch: rawEnv === apiKey,
		},
	});
}


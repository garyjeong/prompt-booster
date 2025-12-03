/**
 * 프로젝트 이름 추천 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/ChatService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError } from '@/lib/errors';
import { getEnvConfig } from '@/config/env';
import { z } from 'zod';
import { ProjectNameSuggestionsResponseSchema } from '@/types/chat';
import { createSuccessResponseSchema } from '@/types/api';

const ProjectNameRequestSchema = z.object({
	projectDescription: z.string().min(1, 'projectDescription가 필요합니다.'),
});

export async function POST(request: NextRequest) {
	try {
		// 환경 변수 검증
		const envConfig = getEnvConfig();
		if (!envConfig.openaiApiKey) {
			return NextResponse.json(
				{
					success: false,
					error: {
						error: 'AI 서비스에 연결할 수 없습니다. 관리자에게 문의하세요.',
						code: 'MISSING_API_KEY',
					},
				},
				{ status: 500 }
			);
		}

		// 요청 본문 파싱 및 검증
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			throw new ValidationError('요청 본문을 파싱할 수 없습니다.');
		}

		const validatedBody = ProjectNameRequestSchema.parse(body);

		const chatService = new ChatService();
		const response = await chatService.suggestProjectNames(validatedBody.projectDescription);

		// 응답 검증
		const validatedResponse = ProjectNameSuggestionsResponseSchema.parse(response);
		const responseSchema = createSuccessResponseSchema(ProjectNameSuggestionsResponseSchema);

		// 응답 형식 검증
		const apiResponse = { success: true as const, data: validatedResponse };
		responseSchema.parse(apiResponse);

		return NextResponse.json(apiResponse);
	} catch (error) {
		return handleError(error);
	}
}


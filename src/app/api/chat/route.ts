/**
 * 다음 질문 생성 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/ChatService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError } from '@/lib/errors';
import { getEnvConfig } from '@/config/env';
import { NextQuestionRequestSchema, NextQuestionResponseSchema } from '@/types/chat';
import { createSuccessResponseSchema } from '@/types/api';

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

		const validatedBody = NextQuestionRequestSchema.parse(body);

		// QuestionAnswer의 Date 필드를 변환
		const normalizedAnswers = validatedBody.previousAnswers.map((qa) => ({
			...qa,
			createdAt: qa.createdAt instanceof Date ? qa.createdAt : qa.createdAt ? new Date(qa.createdAt) : undefined,
			updatedAt: qa.updatedAt instanceof Date ? qa.updatedAt : qa.updatedAt ? new Date(qa.updatedAt) : undefined,
		}));

		const chatService = new ChatService();
		const response = await chatService.generateNextQuestion(
			normalizedAnswers,
			validatedBody.currentAnswer,
			validatedBody.sessionId
		);

		// 응답 검증
		const validatedResponse = NextQuestionResponseSchema.parse(response);
		const responseSchema = createSuccessResponseSchema(NextQuestionResponseSchema);

		// 응답 형식 검증
		const apiResponse = { success: true as const, data: validatedResponse };
		responseSchema.parse(apiResponse);

		return NextResponse.json(apiResponse);
	} catch (error) {
		return handleError(error);
	}
}


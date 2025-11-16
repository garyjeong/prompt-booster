/**
 * 다음 질문 생성 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/ChatService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError } from '@/lib/errors';
import { getEnvConfig } from '@/config/env';
import type { NextQuestionRequest } from '@/types/chat';

export async function POST(request: NextRequest) {
	try {
		// 환경 변수 검증
		const envConfig = getEnvConfig();
		if (!envConfig.geminiApiKey) {
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

		const body: NextQuestionRequest = await request.json();

		if (!body.previousAnswers || !Array.isArray(body.previousAnswers)) {
			throw new ValidationError('previousAnswers가 필요합니다.');
		}

		const chatService = new ChatService();
		const response = await chatService.generateNextQuestion(
			body.previousAnswers,
			body.currentAnswer,
			body.sessionId
		);

		return NextResponse.json({ success: true, data: response });
	} catch (error) {
		return handleError(error);
	}
}


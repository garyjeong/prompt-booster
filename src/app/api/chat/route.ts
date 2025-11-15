/**
 * 다음 질문 생성 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/ChatService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError } from '@/lib/errors';
import type { NextQuestionRequest } from '@/types/chat';

export async function POST(request: NextRequest) {
	try {
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


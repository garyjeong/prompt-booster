/**
 * 프로젝트 이름 추천 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/ChatService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { projectDescription } = body;

		if (!projectDescription || typeof projectDescription !== 'string') {
			throw new ValidationError('projectDescription가 필요합니다.');
		}

		const chatService = new ChatService();
		const response = await chatService.suggestProjectNames(projectDescription);

		return NextResponse.json({ success: true, data: response });
	} catch (error) {
		return handleError(error);
	}
}


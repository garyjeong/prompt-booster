/**
 * 특정 채팅 세션 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChatSessionService } from '@/services/ChatSessionService';
import { handleError } from '@/lib/middleware/error-handler';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';

/**
 * GET: 특정 채팅 세션 조회
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> }
) {
	try {
		const { sessionId } = await params;
		const session = await getServerSession(authOptions);

		const chatSessionService = new ChatSessionService();
		const chatSession = await chatSessionService.getSessionBySessionId(
			sessionId
		);

		if (!chatSession) {
			throw new NotFoundError('채팅 세션을 찾을 수 없습니다.');
		}

		// 사용자 인증 확인 (자신의 세션이거나 비인증 세션인 경우만)
		if (chatSession.userId && session?.user?.id !== chatSession.userId) {
			throw new UnauthorizedError('이 채팅 세션에 접근할 권한이 없습니다.');
		}

		return NextResponse.json({ success: true, data: chatSession });
	} catch (error) {
		return handleError(error);
	}
}

/**
 * DELETE: 채팅 세션 삭제
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> }
) {
	try {
		const { sessionId } = await params;
		const session = await getServerSession(authOptions);

		const chatSessionService = new ChatSessionService();
		const chatSession = await chatSessionService.getSessionBySessionId(
			sessionId
		);

		if (!chatSession) {
			throw new NotFoundError('채팅 세션을 찾을 수 없습니다.');
		}

		// 사용자 인증 확인
		if (chatSession.userId && session?.user?.id !== chatSession.userId) {
			throw new UnauthorizedError('이 채팅 세션을 삭제할 권한이 없습니다.');
		}

		await chatSessionService.deleteSession(sessionId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return handleError(error);
	}
}


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
		const { searchParams } = new URL(request.url);
		const forceDelete =
			searchParams.get('force') === 'true' ||
			searchParams.get('hard') === 'true' ||
			searchParams.get('permanent') === 'true';

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

		if (forceDelete) {
			await chatSessionService.deleteSessionPermanently(sessionId);
		} else {
			await chatSessionService.deleteSession(sessionId);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return handleError(error);
	}
}

/**
 * PATCH: 채팅 세션 복구 등 상태 변경
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> }
) {
	try {
		const { sessionId } = await params;
		const session = await getServerSession(authOptions);
		const body = await request.json().catch(() => ({}));

		if (!body?.action) {
			throw new NotFoundError('요청 action이 필요합니다.');
		}

		const chatSessionService = new ChatSessionService();
		const chatSession = await chatSessionService.getSessionBySessionId(
			sessionId
		);

		if (!chatSession) {
			throw new NotFoundError('채팅 세션을 찾을 수 없습니다.');
		}

		if (chatSession.userId && session?.user?.id !== chatSession.userId) {
			throw new UnauthorizedError('이 채팅 세션에 접근할 권한이 없습니다.');
		}

		if (body.action === 'restore') {
			await chatSessionService.restoreSession(sessionId);
		} else {
			throw new NotFoundError('지원하지 않는 action입니다.');
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return handleError(error);
	}
}


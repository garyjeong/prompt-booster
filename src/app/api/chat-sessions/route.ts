/**
 * 채팅 세션 API
 * 채팅 세션 CRUD 작업
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChatSessionService } from '@/services/ChatSessionService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import type { ChatSessionStorage } from '@/lib/storage';

/**
 * GET: 채팅 세션 목록 조회
 */
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			throw new UnauthorizedError('로그인이 필요합니다.');
		}

		const { searchParams } = new URL(request.url);
		const limit = searchParams.get('limit')
			? parseInt(searchParams.get('limit')!, 10)
			: undefined;
		const offset = searchParams.get('offset')
			? parseInt(searchParams.get('offset')!, 10)
			: undefined;

		const statusParam = searchParams.get('status') || 'active';

		const chatSessionService = new ChatSessionService();
		const sessions =
			statusParam === 'trash'
				? await chatSessionService.getDeletedSessionsByUserId(
						session.user.id,
						limit,
						offset
					)
				: await chatSessionService.getSessionsByUserId(
						session.user.id,
						limit,
						offset
					);

		return NextResponse.json({ success: true, data: sessions });
	} catch (error) {
		return handleError(error);
	}
}

/**
 * POST: 채팅 세션 저장
 */
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		const userId = session?.user?.id;

		const body: ChatSessionStorage = await request.json();

		if (!body.sessionId) {
			throw new ValidationError('sessionId가 필요합니다.');
		}

		const chatSessionService = new ChatSessionService();
		const savedSession = await chatSessionService.saveSession(body, userId);

		return NextResponse.json({ success: true, data: savedSession });
	} catch (error) {
		return handleError(error);
	}
}

/**
 * DELETE: 삭제된 채팅 세션 모두 영구 삭제
 */
export async function DELETE(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			throw new UnauthorizedError('로그인이 필요합니다.');
		}

		const { searchParams } = new URL(request.url);
		const statusParam = searchParams.get('status');

		if (statusParam !== 'trash') {
			throw new ValidationError('status=trash 파라미터가 필요합니다.');
		}

		const chatSessionService = new ChatSessionService();
		await chatSessionService.deleteAllDeletedSessions(session.user.id);

		return NextResponse.json({ success: true });
	} catch (error) {
		return handleError(error);
	}
}


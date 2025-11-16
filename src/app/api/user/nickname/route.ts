/**
 * 닉네임 관리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserService } from '@/services/UserService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError, UnauthorizedError } from '@/lib/errors';

/**
 * GET: 현재 사용자 닉네임 조회
 */
export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			throw new UnauthorizedError('로그인이 필요합니다.');
		}

		const userService = new UserService();
		const nickname = await userService.getNickname(session.user.id);

		return NextResponse.json({
			success: true,
			data: {
				nickname,
			},
		});
	} catch (error) {
		return handleError(error);
	}
}

/**
 * PUT: 닉네임 설정/수정
 */
export async function PUT(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			throw new UnauthorizedError('로그인이 필요합니다.');
		}

		const body = await request.json();
		const { nickname } = body;

		if (!nickname || typeof nickname !== 'string') {
			throw new ValidationError('닉네임이 필요합니다.');
		}

		const userService = new UserService();
		const result = await userService.setNickname(session.user.id, nickname);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		return handleError(error);
	}
}


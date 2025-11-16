/**
 * 문서 생성 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DocumentService } from '@/services/DocumentService';
import { handleError } from '@/lib/middleware/error-handler';
import { ValidationError } from '@/lib/errors';
import { getEnvConfig } from '@/config/env';
import type { DocumentGenerationRequest } from '@/types/chat';

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

		const session = await getServerSession(authOptions);
		
		// 개발 모드: 인증 없이도 문서 생성 가능 (임시 사용자로 저장)
		let userEmail: string;
		if (session?.user?.email) {
			userEmail = session.user.email;
		} else {
			// 개발 모드: 임시 사용자 이메일 사용
			userEmail = 'dev@localhost';
		}

		const body: DocumentGenerationRequest = await request.json();

		if (
			!body.questionAnswers ||
			!Array.isArray(body.questionAnswers) ||
			body.questionAnswers.length === 0
		) {
			throw new ValidationError('questionAnswers가 필요합니다.');
		}

		const documentService = new DocumentService();
		const response = await documentService.createDocument(
			userEmail,
			body.questionAnswers
		);

		return NextResponse.json({ success: true, data: response });
	} catch (error) {
		return handleError(error);
	}
}


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
import { DocumentGenerationRequestSchema, DocumentGenerationResponseSchema } from '@/types/chat';
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

		const session = await getServerSession(authOptions);
		
		// 개발 모드: 인증 없이도 문서 생성 가능 (임시 사용자로 저장)
		let userEmail: string;
		if (session?.user?.email) {
			userEmail = session.user.email;
		} else {
			// 개발 모드: 임시 사용자 이메일 사용
			userEmail = 'dev@localhost';
		}

		// 요청 본문 파싱 및 검증
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			throw new ValidationError('요청 본문을 파싱할 수 없습니다.');
		}

		const validatedBody = DocumentGenerationRequestSchema.parse(body);

		if (validatedBody.questionAnswers.length === 0) {
			throw new ValidationError('questionAnswers가 비어있습니다.');
		}

		// QuestionAnswer의 Date 필드를 변환
		const normalizedAnswers = validatedBody.questionAnswers.map((qa) => ({
			...qa,
			createdAt: qa.createdAt instanceof Date ? qa.createdAt : qa.createdAt ? new Date(qa.createdAt) : undefined,
			updatedAt: qa.updatedAt instanceof Date ? qa.updatedAt : qa.updatedAt ? new Date(qa.updatedAt) : undefined,
		}));

		const documentService = new DocumentService();
		const response = await documentService.createDocument(
			userEmail,
			normalizedAnswers
		);

		// 응답 검증
		const validatedResponse = DocumentGenerationResponseSchema.parse(response);
		const responseSchema = createSuccessResponseSchema(DocumentGenerationResponseSchema);

		// 응답 형식 검증
		const apiResponse = { success: true as const, data: validatedResponse };
		responseSchema.parse(apiResponse);

		return NextResponse.json(apiResponse);
	} catch (error) {
		return handleError(error);
	}
}


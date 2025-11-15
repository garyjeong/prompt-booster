/**
 * 문서 다운로드 이력 저장 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DocumentService } from '@/services/DocumentService';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/middleware/error-handler';
import { UnauthorizedError } from '@/lib/errors';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ documentId: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new UnauthorizedError();
		}

		const { documentId } = await params;

		// 문서 소유권 확인 (DocumentService 사용)
		const documentService = new DocumentService();
		await documentService.getDocument(documentId, session.user.email);

		// 다운로드 이력 저장
		await prisma.downloadHistory.create({
			data: {
				documentId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return handleError(error);
	}
}


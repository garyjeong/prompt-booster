/**
 * Document Repository 구현
 * Prisma를 사용한 문서 데이터 접근
 */

import { prisma } from '@/lib/prisma';
import type {
	IDocumentRepository,
	DocumentWithRelations,
	CreateDocumentData,
} from './interfaces/IDocumentRepository';

export class DocumentRepository implements IDocumentRepository {
	async findById(id: string): Promise<DocumentWithRelations | null> {
		return prisma.document.findUnique({
			where: { id },
			include: {
				questionAnswers: {
					orderBy: { order: 'asc' },
				},
			},
		});
	}

	async findByUserId(
		userId: string,
		limit?: number,
		offset?: number
	): Promise<DocumentWithRelations[]> {
		return prisma.document.findMany({
			where: { userId },
			include: {
				questionAnswers: {
					orderBy: { order: 'asc' },
				},
			},
			orderBy: { createdAt: 'desc' },
			take: limit,
			skip: offset,
		});
	}

	async create(data: CreateDocumentData): Promise<DocumentWithRelations> {
		return prisma.document.create({
			data: {
				userId: data.userId,
				title: data.title,
				content: data.content,
				markdown: data.markdown,
				questionAnswers: data.questionAnswers
					? {
							create: data.questionAnswers,
						}
					: undefined,
			},
			include: {
				questionAnswers: {
					orderBy: { order: 'asc' },
				},
			},
		});
	}

	async update(
		id: string,
		data: Partial<Pick<DocumentWithRelations, 'title' | 'content' | 'markdown'>>
	): Promise<DocumentWithRelations> {
		return prisma.document.update({
			where: { id },
			data,
			include: {
				questionAnswers: {
					orderBy: { order: 'asc' },
				},
			},
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.document.delete({
			where: { id },
		});
	}

	async exists(id: string): Promise<boolean> {
		const count = await prisma.document.count({
			where: { id },
		});
		return count > 0;
	}
}


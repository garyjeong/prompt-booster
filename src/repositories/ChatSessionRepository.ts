/**
 * ChatSession Repository 구현
 * Prisma를 사용한 채팅 세션 데이터 접근
 */

import { prisma } from '@/lib/prisma';
import type {
	IChatSessionRepository,
	ChatSessionWithRelations,
	CreateChatSessionData,
	UpdateChatSessionData,
} from './interfaces/IChatSessionRepository';

export class ChatSessionRepository implements IChatSessionRepository {
	async findById(id: string): Promise<ChatSessionWithRelations | null> {
		return prisma.chatSession.findUnique({
			where: { id },
			include: {
				questionAnswers: {
					orderBy: { order: 'asc' },
				},
			},
		});
	}

	async findBySessionId(
		sessionId: string
	): Promise<ChatSessionWithRelations | null> {
		return prisma.chatSession.findUnique({
			where: { sessionId },
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
	): Promise<ChatSessionWithRelations[]> {
		return prisma.chatSession.findMany({
			where: { userId, isDeleted: false },
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

	async findDeletedByUserId(
		userId: string,
		limit?: number,
		offset?: number
	): Promise<ChatSessionWithRelations[]> {
		return prisma.chatSession.findMany({
			where: { userId, isDeleted: true },
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

	async create(
		data: CreateChatSessionData
	): Promise<ChatSessionWithRelations> {
		return prisma.chatSession.create({
			data: {
				userId: data.userId,
				sessionId: data.sessionId,
				title: data.title,
				projectDescription: data.projectDescription,
				currentQuestion: data.currentQuestion,
				isCompleted: data.isCompleted ?? false,
				isDeleted: data.isDeleted ?? false,
				deletedAt: data.deletedAt ?? null,
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
		data: UpdateChatSessionData
	): Promise<ChatSessionWithRelations> {
		return prisma.chatSession.update({
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
		await prisma.chatSession.delete({
			where: { id },
		});
	}

	async deleteBySessionId(sessionId: string): Promise<void> {
		await this.hardDeleteBySessionId(sessionId);
	}

	async softDeleteBySessionId(sessionId: string): Promise<void> {
		await prisma.chatSession.update({
			where: { sessionId },
			data: {
				isDeleted: true,
				deletedAt: new Date(),
			},
		});
	}

	async restoreBySessionId(sessionId: string): Promise<void> {
		await prisma.chatSession.update({
			where: { sessionId },
			data: {
				isDeleted: false,
				deletedAt: null,
			},
		});
	}

	async hardDeleteBySessionId(sessionId: string): Promise<void> {
		await prisma.chatSession.delete({
			where: { sessionId },
		});
	}

	async hardDeleteDeletedByUserId(userId: string): Promise<void> {
		await prisma.chatSession.deleteMany({
			where: {
				userId,
				isDeleted: true,
			},
		});
	}

	async exists(id: string): Promise<boolean> {
		const count = await prisma.chatSession.count({
			where: { id },
		});
		return count > 0;
	}

	async existsBySessionId(sessionId: string): Promise<boolean> {
		const count = await prisma.chatSession.count({
			where: { sessionId },
		});
		return count > 0;
	}
}


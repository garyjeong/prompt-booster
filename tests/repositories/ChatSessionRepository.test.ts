/**
 * ChatSessionRepository 테스트
 */

import { ChatSessionRepository } from '@/repositories/ChatSessionRepository';
import { prisma } from '@/lib/prisma';

// Prisma 모킹
jest.mock('@/lib/prisma', () => ({
	prisma: {
		chatSession: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			count: jest.fn(),
		},
	},
}));

describe('ChatSessionRepository', () => {
	let repository: ChatSessionRepository;

	beforeEach(() => {
		repository = new ChatSessionRepository();
		jest.clearAllMocks();
	});

	describe('findById', () => {
		it('ID로 세션을 조회해야 함', async () => {
			const mockSession = {
				id: 'test-id',
				userId: 'user-1',
				sessionId: 'session-1',
				title: '테스트 세션',
				projectDescription: null,
				currentQuestion: null,
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			(prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(mockSession);

			const result = await repository.findById('test-id');

			expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
				where: { id: 'test-id' },
				include: {
					questionAnswers: {
						orderBy: { order: 'asc' },
					},
				},
			});
			expect(result).toEqual(mockSession);
		});

		it('세션이 없으면 null을 반환해야 함', async () => {
			(prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);

			const result = await repository.findById('non-existent');

			expect(result).toBeNull();
		});
	});

	describe('findBySessionId', () => {
		it('세션 ID로 세션을 조회해야 함', async () => {
			const mockSession = {
				id: 'test-id',
				sessionId: 'session-1',
				questionAnswers: [],
			};

			(prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(mockSession);

			const result = await repository.findBySessionId('session-1');

			expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
				where: { sessionId: 'session-1' },
				include: {
					questionAnswers: {
						orderBy: { order: 'asc' },
					},
				},
			});
			expect(result).toEqual(mockSession);
		});
	});

	describe('findByUserId', () => {
		it('사용자 ID로 세션 목록을 조회해야 함', async () => {
			const mockSessions = [
				{
					id: 'test-id-1',
					userId: 'user-1',
					sessionId: 'session-1',
					questionAnswers: [],
				},
			];

			(prisma.chatSession.findMany as jest.Mock).mockResolvedValue(mockSessions);

			const result = await repository.findByUserId('user-1', 10, 0);

			expect(prisma.chatSession.findMany).toHaveBeenCalledWith({
				where: { userId: 'user-1' },
				include: {
					questionAnswers: {
						orderBy: { order: 'asc' },
					},
				},
				orderBy: { createdAt: 'desc' },
				take: 10,
				skip: 0,
			});
			expect(result).toEqual(mockSessions);
		});
	});

	describe('create', () => {
		it('새 세션을 생성해야 함', async () => {
			const createData = {
				sessionId: 'session-1',
				title: '테스트 세션',
				questionAnswers: [
					{
						question: '질문 1',
						answer: '답변 1',
						order: 1,
					},
				],
			};

			const mockCreated = {
				id: 'db-id-1',
				...createData,
				userId: null,
				projectDescription: null,
				currentQuestion: null,
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [
					{
						id: 'qa-1',
						chatSessionId: 'db-id-1',
						question: '질문 1',
						answer: '답변 1',
						order: 1,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
			};

			(prisma.chatSession.create as jest.Mock).mockResolvedValue(mockCreated);

			const result = await repository.create(createData);

			expect(prisma.chatSession.create).toHaveBeenCalled();
			expect(result).toEqual(mockCreated);
		});
	});

	describe('update', () => {
		it('세션을 업데이트해야 함', async () => {
			const updateData = {
				title: '업데이트된 제목',
				isCompleted: true,
			};

			const mockUpdated = {
				id: 'test-id',
				sessionId: 'session-1',
				...updateData,
				userId: null,
				projectDescription: null,
				currentQuestion: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			(prisma.chatSession.update as jest.Mock).mockResolvedValue(mockUpdated);

			const result = await repository.update('test-id', updateData);

			expect(prisma.chatSession.update).toHaveBeenCalledWith({
				where: { id: 'test-id' },
				data: updateData,
				include: {
					questionAnswers: {
						orderBy: { order: 'asc' },
					},
				},
			});
			expect(result).toEqual(mockUpdated);
		});
	});

	describe('delete', () => {
		it('세션을 삭제해야 함', async () => {
			(prisma.chatSession.delete as jest.Mock).mockResolvedValue(undefined);

			await repository.delete('test-id');

			expect(prisma.chatSession.delete).toHaveBeenCalledWith({
				where: { id: 'test-id' },
			});
		});
	});

	describe('exists', () => {
		it('세션이 존재하면 true를 반환해야 함', async () => {
			(prisma.chatSession.count as jest.Mock).mockResolvedValue(1);

			const result = await repository.exists('test-id');

			expect(result).toBe(true);
		});

		it('세션이 없으면 false를 반환해야 함', async () => {
			(prisma.chatSession.count as jest.Mock).mockResolvedValue(0);

			const result = await repository.exists('non-existent');

			expect(result).toBe(false);
		});
	});

	describe('existsBySessionId', () => {
		it('세션이 존재하면 true를 반환해야 함', async () => {
			(prisma.chatSession.count as jest.Mock).mockResolvedValue(1);

			const result = await repository.existsBySessionId('session-1');

			expect(prisma.chatSession.count).toHaveBeenCalledWith({
				where: { sessionId: 'session-1' },
			});
			expect(result).toBe(true);
		});

		it('세션이 없으면 false를 반환해야 함', async () => {
			(prisma.chatSession.count as jest.Mock).mockResolvedValue(0);

			const result = await repository.existsBySessionId('non-existent');

			expect(result).toBe(false);
		});
	});
});


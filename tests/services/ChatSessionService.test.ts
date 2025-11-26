/**
 * ChatSessionService 테스트
 */

import { ChatSessionService } from '@/services/ChatSessionService';
import type { IChatSessionRepository } from '@/repositories/interfaces/IChatSessionRepository';
import type { ChatSessionStorage } from '@/lib/storage';

describe('ChatSessionService', () => {
	let mockRepository: jest.Mocked<IChatSessionRepository>;
	let service: ChatSessionService;

	beforeEach(() => {
		mockRepository = {
			findById: jest.fn(),
			findBySessionId: jest.fn(),
			findByUserId: jest.fn(),
			findDeletedByUserId: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			deleteBySessionId: jest.fn(),
			softDeleteBySessionId: jest.fn(),
			restoreBySessionId: jest.fn(),
			hardDeleteBySessionId: jest.fn(),
			hardDeleteDeletedByUserId: jest.fn(),
			exists: jest.fn(),
			existsBySessionId: jest.fn(),
		} as any;

		service = new ChatSessionService(mockRepository);
	});

	describe('saveSession', () => {
		it('새 세션을 생성해야 함', async () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [
					{
						id: 'qa-1',
						question: '질문 1',
						answer: '답변 1',
						order: 1,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				isCompleted: false,
				isDeleted: false,
				deletedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				title: '테스트 세션',
			};

			mockRepository.findBySessionId.mockResolvedValue(null);
			mockRepository.create.mockResolvedValue({
				id: 'db-id-1',
				userId: null,
				sessionId: 'test-session-1',
				title: '테스트 세션',
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
			});

			const result = await service.saveSession(session);

			expect(mockRepository.findBySessionId).toHaveBeenCalledWith('test-session-1');
			expect(mockRepository.create).toHaveBeenCalled();
			expect(result.sessionId).toBe('test-session-1');
		});

		it('기존 세션을 업데이트해야 함', async () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const existing = {
				id: 'db-id-1',
				userId: null,
				sessionId: 'test-session-1',
				title: null,
				projectDescription: null,
				currentQuestion: null,
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
				isDeleted: false,
				deletedAt: null,
			};

			mockRepository.findBySessionId.mockResolvedValue(existing);
			mockRepository.update.mockResolvedValue({
				...existing,
				isCompleted: true,
			});

			const result = await service.saveSession(session);

			expect(mockRepository.update).toHaveBeenCalledWith('db-id-1', {
				title: undefined,
				projectDescription: undefined,
				currentQuestion: undefined,
				isCompleted: true,
				isDeleted: false,
				deletedAt: null,
			});
			expect(result.isCompleted).toBe(true);
		});
	});

	describe('getSessionBySessionId', () => {
		it('세션 ID로 세션을 조회해야 함', async () => {
			const mockSession = {
				id: 'db-id-1',
				userId: null,
				sessionId: 'test-session-1',
				title: null,
				projectDescription: null,
				currentQuestion: null,
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
				isDeleted: false,
				deletedAt: null,
			};

			mockRepository.findBySessionId.mockResolvedValue(mockSession);

			const result = await service.getSessionBySessionId('test-session-1');

			expect(mockRepository.findBySessionId).toHaveBeenCalledWith('test-session-1');
			expect(result).toBeTruthy();
			expect(result?.sessionId).toBe('test-session-1');
		});

		it('세션이 없으면 null을 반환해야 함', async () => {
			mockRepository.findBySessionId.mockResolvedValue(null);

			const result = await service.getSessionBySessionId('non-existent');

			expect(result).toBeNull();
		});
	});

	describe('getSessionsByUserId', () => {
		it('사용자 ID로 세션 목록을 조회해야 함', async () => {
			const mockSessions = [
				{
					id: 'db-id-1',
					userId: 'user-1',
					sessionId: 'session-1',
					title: null,
					projectDescription: null,
					currentQuestion: null,
					isCompleted: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					questionAnswers: [],
				},
			];

			mockRepository.findByUserId.mockResolvedValue(mockSessions);

			const result = await service.getSessionsByUserId('user-1');

			expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1', undefined, undefined);
			expect(result.length).toBe(1);
			expect(result[0].userId).toBe('user-1');
		});
	});

	describe('getDeletedSessionsByUserId', () => {
		it('삭제된 세션 목록을 조회해야 함', async () => {
			mockRepository.findDeletedByUserId.mockResolvedValue([]);

			await service.getDeletedSessionsByUserId('user-1', 10, 0);

			expect(mockRepository.findDeletedByUserId).toHaveBeenCalledWith(
				'user-1',
				10,
				0
			);
		});
	});

	describe('deleteSession', () => {
		it('세션을 삭제해야 함', async () => {
			mockRepository.softDeleteBySessionId.mockResolvedValue(undefined);

			await service.deleteSession('test-session-1');

			expect(mockRepository.softDeleteBySessionId).toHaveBeenCalledWith(
				'test-session-1'
			);
		});
	});

	describe('restoreSession', () => {
		it('세션을 복구해야 함', async () => {
			mockRepository.restoreBySessionId.mockResolvedValue(undefined);

			await service.restoreSession('test-session-1');

			expect(mockRepository.restoreBySessionId).toHaveBeenCalledWith(
				'test-session-1'
			);
		});
	});

	describe('deleteSessionPermanently', () => {
		it('세션을 완전히 삭제해야 함', async () => {
			mockRepository.hardDeleteBySessionId.mockResolvedValue(undefined);

			await service.deleteSessionPermanently('test-session-1');

			expect(mockRepository.hardDeleteBySessionId).toHaveBeenCalledWith(
				'test-session-1'
			);
		});
	});

	describe('deleteAllDeletedSessions', () => {
		it('삭제된 세션을 모두 삭제해야 함', async () => {
			mockRepository.hardDeleteDeletedByUserId.mockResolvedValue(undefined);

			await service.deleteAllDeletedSessions('user-1');

			expect(
				mockRepository.hardDeleteDeletedByUserId
			).toHaveBeenCalledWith('user-1');
		});
	});

	describe('toStorageFormat', () => {
		it('DTO를 로컬 스토리지 형식으로 변환해야 함', () => {
			const dto = {
				id: 'db-id-1',
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
				title: '테스트 세션',
				isDeleted: false,
				deletedAt: null,
			};

			const storage = service.toStorageFormat(dto);

			expect(storage.sessionId).toBe('test-session-1');
			expect(storage.title).toBe('테스트 세션');
			expect(storage.isCompleted).toBe(false);
		});

		it('모든 필드를 올바르게 변환해야 함', () => {
			const dto = {
				id: 'db-id-1',
				userId: 'user-1',
				sessionId: 'test-session-1',
				title: '테스트 세션',
				projectDescription: '프로젝트 설명',
				currentQuestion: '현재 질문',
				questionAnswers: [
					{
						id: 'qa-1',
						question: '질문 1',
						answer: '답변 1',
						order: 1,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				isCompleted: true,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-02'),
				isDeleted: false,
				deletedAt: null,
			};

			const storage = service.toStorageFormat(dto);

			expect(storage.sessionId).toBe('test-session-1');
			expect(storage.title).toBe('테스트 세션');
			expect(storage.projectDescription).toBe('프로젝트 설명');
			expect(storage.currentQuestion).toBe('현재 질문');
			expect(storage.isCompleted).toBe(true);
			expect(storage.questionAnswers.length).toBe(1);
		});
	});

	describe('saveSession - edge cases', () => {
		it('userId가 있는 경우 저장해야 함', async () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.findBySessionId.mockResolvedValue(null);
			mockRepository.create.mockResolvedValue({
				id: 'db-id-1',
				userId: 'user-1',
				sessionId: 'test-session-1',
				title: null,
				projectDescription: null,
				currentQuestion: null,
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			});

			const result = await service.saveSession(session, 'user-1');

			expect(mockRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'user-1',
				})
			);
			expect(result.userId).toBe('user-1');
		});

		it('userId가 없는 경우에도 저장할 수 있어야 함', async () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.findBySessionId.mockResolvedValue(null);
			mockRepository.create.mockResolvedValue({
				id: 'db-id-1',
				userId: null,
				sessionId: 'test-session-1',
				title: null,
				projectDescription: null,
				currentQuestion: null,
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			});

			const result = await service.saveSession(session);

			expect(mockRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: undefined,
				})
			);
			expect(result.userId).toBeUndefined();
		});
	});

	describe('getSessionsByUserId - edge cases', () => {
		it('limit와 offset을 사용할 수 있어야 함', async () => {
			mockRepository.findByUserId.mockResolvedValue([]);

			await service.getSessionsByUserId('user-1', 20, 10);

			expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1', 20, 10);
		});

		it('limit와 offset 없이 조회할 수 있어야 함', async () => {
			mockRepository.findByUserId.mockResolvedValue([]);

			await service.getSessionsByUserId('user-1');

			expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1', undefined, undefined);
		});
	});
});


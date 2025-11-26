/**
 * DocumentService 테스트
 */

import { DocumentService } from '@/services/DocumentService';
import { DocumentRepository } from '@/repositories/DocumentRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { generateDocument } from '@/lib/openai-client';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import type { QuestionAnswer } from '@/types/chat';

// 모킹
jest.mock('@/repositories/DocumentRepository');
jest.mock('@/repositories/UserRepository');
jest.mock('@/lib/openai-client', () => ({
	generateDocument: jest.fn(),
}));

describe('DocumentService', () => {
	let mockDocumentRepository: jest.Mocked<DocumentRepository>;
	let mockUserRepository: jest.Mocked<UserRepository>;
	let service: DocumentService;

	beforeEach(() => {
		mockDocumentRepository = {
			findById: jest.fn(),
			findByUserId: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			exists: jest.fn(),
		} as any;

		mockUserRepository = {
			findByEmail: jest.fn(),
			create: jest.fn(),
		} as any;

		service = new DocumentService(mockDocumentRepository, mockUserRepository);
		jest.clearAllMocks();
	});

	describe('createDocument', () => {
		it('문서를 생성해야 함', async () => {
			const questionAnswers: QuestionAnswer[] = [
				{
					id: 'qa-1',
					question: '질문 1',
					answer: '답변 1',
					order: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
			};

			const mockDocument = {
				id: 'doc-1',
				userId: 'user-1',
				title: '테스트 문서',
				content: '내용',
				markdown: '# 테스트 문서',
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			(generateDocument as jest.Mock).mockResolvedValue({
				title: '테스트 문서',
				markdown: '# 테스트 문서',
			});
			mockDocumentRepository.create.mockResolvedValue(mockDocument);

			const result = await service.createDocument('test@example.com', questionAnswers);

			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
			expect(generateDocument).toHaveBeenCalledWith(questionAnswers);
			expect(mockDocumentRepository.create).toHaveBeenCalled();
			expect(result.documentId).toBe('doc-1');
		});

		it('개발 모드에서 사용자가 없으면 자동 생성해야 함', async () => {
			const questionAnswers: QuestionAnswer[] = [];

			const mockUser = {
				id: 'user-1',
				email: 'dev@localhost',
				name: 'Development User',
			};

			const mockDocument = {
				id: 'doc-1',
				userId: 'user-1',
				title: '테스트 문서',
				content: '내용',
				markdown: '# 테스트 문서',
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			mockUserRepository.findByEmail.mockResolvedValue(null);
			mockUserRepository.create.mockResolvedValue(mockUser);
			(generateDocument as jest.Mock).mockResolvedValue({
				title: '테스트 문서',
				markdown: '# 테스트 문서',
			});
			mockDocumentRepository.create.mockResolvedValue(mockDocument);

			const result = await service.createDocument('dev@localhost', questionAnswers);

			expect(mockUserRepository.create).toHaveBeenCalledWith({
				email: 'dev@localhost',
				name: 'Development User',
			});
			expect(result.documentId).toBe('doc-1');
		});

		it('사용자가 없으면 NotFoundError를 던져야 함', async () => {
			mockUserRepository.findByEmail.mockResolvedValue(null);

			await expect(
				service.createDocument('unknown@example.com', [])
			).rejects.toThrow(NotFoundError);
		});
	});

	describe('getDocument', () => {
		it('문서를 조회해야 함', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
			};

			const mockDocument = {
				id: 'doc-1',
				userId: 'user-1',
				title: '테스트 문서',
				content: '내용',
				markdown: '# 테스트 문서',
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			mockDocumentRepository.findById.mockResolvedValue(mockDocument);

			const result = await service.getDocument('doc-1', 'test@example.com');

			expect(result.documentId).toBe('doc-1');
		});

		it('소유자가 아니면 UnauthorizedError를 던져야 함', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
			};

			const mockDocument = {
				id: 'doc-1',
				userId: 'user-2', // 다른 사용자
				title: '테스트 문서',
				content: '내용',
				markdown: '# 테스트 문서',
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			mockDocumentRepository.findById.mockResolvedValue(mockDocument);

			await expect(
				service.getDocument('doc-1', 'test@example.com')
			).rejects.toThrow(UnauthorizedError);
		});
	});

	describe('getUserDocuments', () => {
		it('사용자의 문서 목록을 조회해야 함', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
			};

			const mockDocuments = [
				{
					id: 'doc-1',
					userId: 'user-1',
					title: '문서 1',
					content: '내용 1',
					markdown: '# 문서 1',
					createdAt: new Date(),
					updatedAt: new Date(),
					questionAnswers: [],
				},
			];

			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			mockDocumentRepository.findByUserId.mockResolvedValue(mockDocuments);

			const result = await service.getUserDocuments('test@example.com', 10, 0);

			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
			expect(mockDocumentRepository.findByUserId).toHaveBeenCalledWith('user-1', 10, 0);
			expect(result.length).toBe(1);
			expect(result[0].documentId).toBe('doc-1');
		});

		it('사용자가 없으면 NotFoundError를 던져야 함', async () => {
			mockUserRepository.findByEmail.mockResolvedValue(null);

			await expect(
				service.getUserDocuments('unknown@example.com')
			).rejects.toThrow(NotFoundError);
		});

		it('limit와 offset 없이 조회할 수 있어야 함', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
			};

			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			mockDocumentRepository.findByUserId.mockResolvedValue([]);

			await service.getUserDocuments('test@example.com');

			expect(mockDocumentRepository.findByUserId).toHaveBeenCalledWith('user-1', undefined, undefined);
		});
	});
});


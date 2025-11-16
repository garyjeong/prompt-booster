/**
 * DocumentRepository 테스트
 */

import { DocumentRepository } from '@/repositories/DocumentRepository';
import { prisma } from '@/lib/prisma';

// Prisma 모킹
jest.mock('@/lib/prisma', () => ({
	prisma: {
		document: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			count: jest.fn(),
		},
	},
}));

describe('DocumentRepository', () => {
	let repository: DocumentRepository;

	beforeEach(() => {
		repository = new DocumentRepository();
		jest.clearAllMocks();
	});

	describe('findById', () => {
		it('ID로 문서를 조회해야 함', async () => {
			const mockDocument = {
				id: 'doc-1',
				userId: 'user-1',
				title: '테스트 문서',
				content: '내용',
				markdown: '# 테스트',
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			(prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDocument);

			const result = await repository.findById('doc-1');

			expect(prisma.document.findUnique).toHaveBeenCalledWith({
				where: { id: 'doc-1' },
				include: {
					questionAnswers: {
						orderBy: { order: 'asc' },
					},
				},
			});
			expect(result).toEqual(mockDocument);
		});
	});

	describe('findByUserId', () => {
		it('사용자 ID로 문서 목록을 조회해야 함', async () => {
			const mockDocuments = [
				{
					id: 'doc-1',
					userId: 'user-1',
					title: '문서 1',
					questionAnswers: [],
				},
			];

			(prisma.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);

			const result = await repository.findByUserId('user-1', 10, 0);

			expect(prisma.document.findMany).toHaveBeenCalledWith({
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
			expect(result).toEqual(mockDocuments);
		});

		it('limit와 offset 없이 조회할 수 있어야 함', async () => {
			(prisma.document.findMany as jest.Mock).mockResolvedValue([]);

			await repository.findByUserId('user-1');

			expect(prisma.document.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { userId: 'user-1' },
					take: undefined,
					skip: undefined,
				})
			);
		});
	});

	describe('create', () => {
		it('questionAnswers와 함께 문서를 생성해야 함', async () => {
			const createData = {
				userId: 'user-1',
				title: '테스트 문서',
				content: '내용',
				markdown: '# 테스트',
				questionAnswers: [
					{
						question: '질문 1',
						answer: '답변 1',
						order: 1,
					},
				],
			};

			const mockCreated = {
				id: 'doc-1',
				...createData,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [
					{
						id: 'qa-1',
						documentId: 'doc-1',
						question: '질문 1',
						answer: '답변 1',
						order: 1,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
			};

			(prisma.document.create as jest.Mock).mockResolvedValue(mockCreated);

			const result = await repository.create(createData);

			expect(prisma.document.create).toHaveBeenCalledWith({
				data: {
					userId: createData.userId,
					title: createData.title,
					content: createData.content,
					markdown: createData.markdown,
					questionAnswers: {
						create: createData.questionAnswers,
					},
				},
				include: {
					questionAnswers: {
						orderBy: { order: 'asc' },
					},
				},
			});
			expect(result).toEqual(mockCreated);
		});

		it('questionAnswers 없이 문서를 생성할 수 있어야 함', async () => {
			const createData = {
				userId: 'user-1',
				title: '테스트 문서',
				content: '내용',
				markdown: '# 테스트',
			};

			const mockCreated = {
				id: 'doc-1',
				...createData,
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			(prisma.document.create as jest.Mock).mockResolvedValue(mockCreated);

			const result = await repository.create(createData);

			expect(prisma.document.create).toHaveBeenCalledWith({
				data: {
					userId: createData.userId,
					title: createData.title,
					content: createData.content,
					markdown: createData.markdown,
					questionAnswers: undefined,
				},
				include: {
					questionAnswers: {
						orderBy: { order: 'asc' },
					},
				},
			});
			expect(result).toEqual(mockCreated);
		});
	});

	describe('update', () => {
		it('문서를 업데이트해야 함', async () => {
			const updateData = {
				title: '업데이트된 제목',
				content: '업데이트된 내용',
			};

			const mockUpdated = {
				id: 'doc-1',
				userId: 'user-1',
				...updateData,
				markdown: '# 업데이트',
				createdAt: new Date(),
				updatedAt: new Date(),
				questionAnswers: [],
			};

			(prisma.document.update as jest.Mock).mockResolvedValue(mockUpdated);

			const result = await repository.update('doc-1', updateData);

			expect(prisma.document.update).toHaveBeenCalledWith({
				where: { id: 'doc-1' },
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
		it('문서를 삭제해야 함', async () => {
			(prisma.document.delete as jest.Mock).mockResolvedValue(undefined);

			await repository.delete('doc-1');

			expect(prisma.document.delete).toHaveBeenCalledWith({
				where: { id: 'doc-1' },
			});
		});
	});

	describe('exists', () => {
		it('문서가 존재하면 true를 반환해야 함', async () => {
			(prisma.document.count as jest.Mock).mockResolvedValue(1);

			const result = await repository.exists('doc-1');

			expect(result).toBe(true);
		});

		it('문서가 없으면 false를 반환해야 함', async () => {
			(prisma.document.count as jest.Mock).mockResolvedValue(0);

			const result = await repository.exists('non-existent');

			expect(result).toBe(false);
		});
	});
});


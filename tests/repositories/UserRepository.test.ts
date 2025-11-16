/**
 * UserRepository 테스트
 */

import { UserRepository } from '@/repositories/UserRepository';
import { prisma } from '@/lib/prisma';

// Prisma 모킹
jest.mock('@/lib/prisma', () => ({
	prisma: {
		user: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
}));

describe('UserRepository', () => {
	let repository: UserRepository;

	beforeEach(() => {
		repository = new UserRepository();
		jest.clearAllMocks();
	});

	describe('findByEmail', () => {
		it('이메일로 사용자를 조회해야 함', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null,
				emailVerified: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

			const result = await repository.findByEmail('test@example.com');

			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
			});
			expect(result).toEqual(mockUser);
		});

		it('사용자가 없으면 null을 반환해야 함', async () => {
			(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

			const result = await repository.findByEmail('nonexistent@example.com');

			expect(result).toBeNull();
		});
	});

	describe('findById', () => {
		it('ID로 사용자를 조회해야 함', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
			};

			(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

			const result = await repository.findById('user-1');

			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { id: 'user-1' },
			});
			expect(result).toEqual(mockUser);
		});
	});

	describe('create', () => {
		it('새 사용자를 생성해야 함', async () => {
			const createData = {
				email: 'new@example.com',
				name: 'New User',
				image: 'https://example.com/image.jpg',
			};

			const mockCreated = {
				id: 'user-2',
				...createData,
				emailVerified: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(prisma.user.create as jest.Mock).mockResolvedValue(mockCreated);

			const result = await repository.create(createData);

			expect(prisma.user.create).toHaveBeenCalledWith({
				data: createData,
			});
			expect(result).toEqual(mockCreated);
		});

		it('이름 없이 사용자를 생성할 수 있어야 함', async () => {
			const createData = {
				email: 'new@example.com',
			};

			const mockCreated = {
				id: 'user-2',
				email: 'new@example.com',
				name: null,
				image: null,
				emailVerified: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(prisma.user.create as jest.Mock).mockResolvedValue(mockCreated);

			const result = await repository.create(createData);

			expect(result).toEqual(mockCreated);
		});
	});

	describe('update', () => {
		it('사용자를 업데이트해야 함', async () => {
			const updateData = {
				name: 'Updated Name',
				image: 'https://example.com/new-image.jpg',
			};

			const mockUpdated = {
				id: 'user-1',
				email: 'test@example.com',
				...updateData,
				emailVerified: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(prisma.user.update as jest.Mock).mockResolvedValue(mockUpdated);

			const result = await repository.update('user-1', updateData);

			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: 'user-1' },
				data: updateData,
			});
			expect(result).toEqual(mockUpdated);
		});

		it('emailVerified를 업데이트할 수 있어야 함', async () => {
			const updateData = {
				emailVerified: new Date(),
			};

			const mockUpdated = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null,
				...updateData,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(prisma.user.update as jest.Mock).mockResolvedValue(mockUpdated);

			const result = await repository.update('user-1', updateData);

			expect(result.emailVerified).toEqual(updateData.emailVerified);
		});
	});
});


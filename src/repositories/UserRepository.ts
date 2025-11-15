/**
 * User Repository 구현
 * Prisma를 사용한 사용자 데이터 접근
 */

import { prisma } from '@/lib/prisma';
import type { IUserRepository } from './interfaces/IUserRepository';
import type { User } from '@prisma/client';

export class UserRepository implements IUserRepository {
	async findByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	async findById(id: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { id },
		});
	}

	async create(data: { email: string; name?: string; image?: string }): Promise<User> {
		return prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				image: data.image,
			},
		});
	}

	async update(
		id: string,
		data: Partial<Pick<User, 'name' | 'image' | 'emailVerified'>>
	): Promise<User> {
		return prisma.user.update({
			where: { id },
			data,
		});
	}
}


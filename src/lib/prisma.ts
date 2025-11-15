/**
 * Prisma 클라이언트 싱글톤
 */

import { PrismaClient } from '@prisma/client';
import { isDevelopment, isProduction } from '@/config/env';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: isDevelopment() ? ['query', 'error', 'warn'] : ['error'],
	});

if (!isProduction()) globalForPrisma.prisma = prisma;


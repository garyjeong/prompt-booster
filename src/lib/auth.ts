/**
 * NextAuth.js 설정
 */

import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import GoogleProvider from 'next-auth/providers/google';
import { getEnvConfig } from '@/config/env';
import type { NextAuthOptions } from 'next-auth';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
		} & DefaultSession['user'];
	}
}

const envConfig = getEnvConfig();

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma) as unknown as ReturnType<typeof PrismaAdapter>,
	providers: [
		...(envConfig.googleClientId && envConfig.googleClientSecret
			? [
					GoogleProvider({
						clientId: envConfig.googleClientId,
						clientSecret: envConfig.googleClientSecret,
					}),
				]
			: []),
	],
	callbacks: {
		async session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
				// 닉네임 정보 포함 (user.name)
				if (user.name) {
					session.user.name = user.name;
				}
			}
			return session;
		},
	},
	pages: {
		signIn: '/auth/signin',
	},
	secret: envConfig.nextAuthSecret,
};


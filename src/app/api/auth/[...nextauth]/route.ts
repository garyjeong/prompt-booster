/**
 * NextAuth.js Route Handler
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEnvConfig } from '@/config/env';

const envConfig = getEnvConfig();

// 환경 변수 검증
if (!envConfig.nextAuthSecret) {
	console.error('NEXTAUTH_SECRET이 설정되지 않았습니다. NextAuth가 제대로 작동하지 않을 수 있습니다.');
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };


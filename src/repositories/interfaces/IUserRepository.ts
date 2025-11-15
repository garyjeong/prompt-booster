/**
 * User Repository 인터페이스
 * 사용자 데이터 접근을 위한 추상화 계층
 */

import type { User } from '@prisma/client';

export interface IUserRepository {
	/**
	 * 이메일로 사용자 조회
	 * @param email 사용자 이메일
	 * @returns 사용자 정보 또는 null
	 */
	findByEmail(email: string): Promise<User | null>;

	/**
	 * ID로 사용자 조회
	 * @param id 사용자 ID
	 * @returns 사용자 정보 또는 null
	 */
	findById(id: string): Promise<User | null>;

	/**
	 * 사용자 생성
	 * @param data 사용자 생성 데이터
	 * @returns 생성된 사용자 정보
	 */
	create(data: {
		email: string;
		name?: string;
		image?: string;
	}): Promise<User>;

	/**
	 * 사용자 업데이트
	 * @param id 사용자 ID
	 * @param data 업데이트할 데이터
	 * @returns 업데이트된 사용자 정보
	 */
	update(id: string, data: Partial<Pick<User, 'name' | 'image' | 'emailVerified'>>): Promise<User>;
}


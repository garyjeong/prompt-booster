/**
 * User Service
 * 사용자 관련 비즈니스 로직 처리
 */

import { UserRepository } from '@/repositories/UserRepository';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository';

export class UserService {
	private userRepository: IUserRepository;

	constructor(userRepository?: IUserRepository) {
		this.userRepository = userRepository || new UserRepository();
	}

	/**
	 * 사용자 닉네임 조회
	 * @param userId 사용자 ID
	 * @returns 닉네임 또는 null
	 */
	async getNickname(userId: string): Promise<string | null> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('사용자');
		}
		return user.name || null;
	}

	/**
	 * 사용자 닉네임 설정/수정
	 * @param userId 사용자 ID
	 * @param nickname 닉네임
	 * @returns 업데이트된 사용자 정보
	 */
	async setNickname(userId: string, nickname: string): Promise<{ name: string }> {
		// 유효성 검증
		this.validateNickname(nickname);

		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('사용자');
		}

		const updated = await this.userRepository.update(userId, {
			name: nickname.trim(),
		});

		return {
			name: updated.name || nickname.trim(),
		};
	}

	/**
	 * 닉네임 유효성 검증
	 * @param nickname 닉네임
	 */
	private validateNickname(nickname: string): void {
		const trimmed = nickname.trim();
		const MIN_LENGTH = 2;
		const MAX_LENGTH = 20;
		const REGEX = /^[a-zA-Z0-9가-힣\s_-]+$/;

		if (trimmed.length < MIN_LENGTH) {
			throw new ValidationError(`닉네임은 최소 ${MIN_LENGTH}자 이상이어야 합니다.`);
		}

		if (trimmed.length > MAX_LENGTH) {
			throw new ValidationError(`닉네임은 최대 ${MAX_LENGTH}자까지 가능합니다.`);
		}

		if (!REGEX.test(trimmed)) {
			throw new ValidationError(
				'닉네임은 영문, 한글, 숫자, 공백, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.'
			);
		}
	}
}


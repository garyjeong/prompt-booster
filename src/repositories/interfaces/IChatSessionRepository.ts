/**
 * ChatSession Repository 인터페이스
 * 채팅 세션 데이터 접근을 위한 추상화 계층
 */

import type { ChatSession, ChatQuestionAnswer } from '@prisma/client';

export interface ChatSessionWithRelations extends ChatSession {
	questionAnswers: ChatQuestionAnswer[];
}

export interface CreateChatSessionData {
	userId?: string;
	sessionId: string;
	title?: string;
	projectDescription?: string;
	currentQuestion?: string;
	isCompleted?: boolean;
	isDeleted?: boolean;
	deletedAt?: Date | null;
	questionAnswers?: Array<{
		question: string;
		answer: string;
		order: number;
	}>;
}

export interface UpdateChatSessionData {
	title?: string;
	projectDescription?: string;
	currentQuestion?: string;
	isCompleted?: boolean;
	isDeleted?: boolean;
	deletedAt?: Date | null;
}

export interface IChatSessionRepository {
	/**
	 * ID로 채팅 세션 조회
	 * @param id 채팅 세션 ID
	 * @returns 채팅 세션 정보 또는 null
	 */
	findById(id: string): Promise<ChatSessionWithRelations | null>;

	/**
	 * 세션 ID로 채팅 세션 조회
	 * @param sessionId 클라이언트 세션 ID
	 * @returns 채팅 세션 정보 또는 null
	 */
	findBySessionId(sessionId: string): Promise<ChatSessionWithRelations | null>;

	/**
	 * 사용자 ID로 채팅 세션 목록 조회
	 * @param userId 사용자 ID
	 * @param limit 조회 개수 제한
	 * @param offset 건너뛸 개수
	 * @returns 채팅 세션 목록
	 */
	findByUserId(
		userId: string,
		limit?: number,
		offset?: number
	): Promise<ChatSessionWithRelations[]>;

	findDeletedByUserId(
		userId: string,
		limit?: number,
		offset?: number
	): Promise<ChatSessionWithRelations[]>;

	/**
	 * 채팅 세션 생성
	 * @param data 채팅 세션 생성 데이터
	 * @returns 생성된 채팅 세션 정보
	 */
	create(data: CreateChatSessionData): Promise<ChatSessionWithRelations>;

	/**
	 * 채팅 세션 업데이트
	 * @param id 채팅 세션 ID
	 * @param data 업데이트할 데이터
	 * @returns 업데이트된 채팅 세션 정보
	 */
	update(
		id: string,
		data: UpdateChatSessionData
	): Promise<ChatSessionWithRelations>;

	/**
	 * 채팅 세션 삭제
	 * @param id 채팅 세션 ID
	 */
	delete(id: string): Promise<void>;

	/**
	 * 세션 ID로 채팅 세션 삭제
	 * @param sessionId 클라이언트 세션 ID
	 */
	deleteBySessionId(sessionId: string): Promise<void>;

	softDeleteBySessionId(sessionId: string): Promise<void>;

	restoreBySessionId(sessionId: string): Promise<void>;

	hardDeleteBySessionId(sessionId: string): Promise<void>;

	hardDeleteDeletedByUserId(userId: string): Promise<void>;

	/**
	 * 채팅 세션 존재 여부 확인
	 * @param id 채팅 세션 ID
	 * @returns 존재 여부
	 */
	exists(id: string): Promise<boolean>;

	/**
	 * 세션 ID로 채팅 세션 존재 여부 확인
	 * @param sessionId 클라이언트 세션 ID
	 * @returns 존재 여부
	 */
	existsBySessionId(sessionId: string): Promise<boolean>;
}


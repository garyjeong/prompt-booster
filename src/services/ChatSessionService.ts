/**
 * ChatSession Service
 * 채팅 세션 관련 비즈니스 로직 처리
 */

import { ChatSessionRepository } from '@/repositories/ChatSessionRepository';
import type { IChatSessionRepository } from '@/repositories/interfaces/IChatSessionRepository';
import type { QuestionAnswer } from '@/types/chat';
import type { ChatSessionStorage } from '@/lib/storage';

export interface ChatSessionDTO {
	id: string;
	userId?: string;
	sessionId: string;
	title?: string;
	projectDescription?: string;
	currentQuestion?: string;
	isCompleted: boolean;
	questionAnswers: QuestionAnswer[];
	createdAt: Date;
	updatedAt: Date;
}

export class ChatSessionService {
	private repository: IChatSessionRepository;

	constructor(repository?: IChatSessionRepository) {
		this.repository = repository || new ChatSessionRepository();
	}

	/**
	 * 채팅 세션 저장 (로컬 스토리지 형식에서 DB로 변환)
	 * @param session 로컬 스토리지 세션 데이터
	 * @param userId 사용자 ID (선택사항)
	 * @returns 저장된 채팅 세션 정보
	 */
	async saveSession(
		session: ChatSessionStorage,
		userId?: string
	): Promise<ChatSessionDTO> {
		// 기존 세션이 있는지 확인
		const existing = await this.repository.findBySessionId(session.sessionId);

		const questionAnswers = session.questionAnswers.map((qa) => ({
			question: qa.question,
			answer: qa.answer,
			order: qa.order,
		}));

		if (existing) {
			// 업데이트
			const updated = await this.repository.update(existing.id, {
				title: session.title,
				projectDescription: session.projectDescription,
				currentQuestion: session.currentQuestion,
				isCompleted: session.isCompleted,
			});

			// 질문/답변 업데이트 (기존 것 삭제 후 재생성)
			// TODO: 더 효율적인 업데이트 로직 구현 필요

			return this.toDTO(updated);
		} else {
			// 생성
			const created = await this.repository.create({
				userId,
				sessionId: session.sessionId,
				title: session.title,
				projectDescription: session.projectDescription,
				currentQuestion: session.currentQuestion,
				isCompleted: session.isCompleted,
				questionAnswers,
			});

			return this.toDTO(created);
		}
	}

	/**
	 * 세션 ID로 채팅 세션 조회
	 * @param sessionId 세션 ID
	 * @returns 채팅 세션 정보 또는 null
	 */
	async getSessionBySessionId(
		sessionId: string
	): Promise<ChatSessionDTO | null> {
		const session = await this.repository.findBySessionId(sessionId);
		return session ? this.toDTO(session) : null;
	}

	/**
	 * 사용자 ID로 채팅 세션 목록 조회
	 * @param userId 사용자 ID
	 * @param limit 조회 개수 제한
	 * @param offset 건너뛸 개수
	 * @returns 채팅 세션 목록
	 */
	async getSessionsByUserId(
		userId: string,
		limit?: number,
		offset?: number
	): Promise<ChatSessionDTO[]> {
		const sessions = await this.repository.findByUserId(userId, limit, offset);
		return sessions.map((s) => this.toDTO(s));
	}

	/**
	 * 채팅 세션 삭제
	 * @param sessionId 세션 ID
	 */
	async deleteSession(sessionId: string): Promise<void> {
		await this.repository.deleteBySessionId(sessionId);
	}

	/**
	 * DB 모델을 DTO로 변환
	 */
	private toDTO(session: {
		id: string;
		userId: string | null;
		sessionId: string;
		title: string | null;
		projectDescription: string | null;
		currentQuestion: string | null;
		isCompleted: boolean;
		questionAnswers: Array<{
			id: string;
			question: string;
			answer: string;
			order: number;
			createdAt: Date;
			updatedAt: Date;
		}>;
		createdAt: Date;
		updatedAt: Date;
	}): ChatSessionDTO {
		return {
			id: session.id,
			userId: session.userId || undefined,
			sessionId: session.sessionId,
			title: session.title || undefined,
			projectDescription: session.projectDescription || undefined,
			currentQuestion: session.currentQuestion || undefined,
			isCompleted: session.isCompleted,
			questionAnswers: session.questionAnswers.map((qa) => ({
				id: qa.id,
				question: qa.question,
				answer: qa.answer,
				order: qa.order,
				createdAt: qa.createdAt,
				updatedAt: qa.updatedAt,
			})),
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
		};
	}

	/**
	 * DTO를 로컬 스토리지 형식으로 변환
	 */
	toStorageFormat(dto: ChatSessionDTO): ChatSessionStorage {
		return {
			sessionId: dto.sessionId,
			questionAnswers: dto.questionAnswers,
			currentQuestion: dto.currentQuestion,
			isCompleted: dto.isCompleted,
			projectDescription: dto.projectDescription,
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
			title: dto.title,
		};
	}
}


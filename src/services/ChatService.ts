/**
 * Chat Service
 * 채팅 관련 비즈니스 로직 처리
 */

import { generateNextQuestion, suggestProjectNames } from '@/lib/gemini-client';
import type { QuestionAnswer } from '@/types/chat';
import type { NextQuestionResponse, ProjectNameSuggestionsResponse } from '@/types/chat';

export class ChatService {
	/**
	 * 다음 질문 생성
	 * @param previousAnswers 이전 질문/답변 목록
	 * @param currentAnswer 현재 답변
	 * @param sessionId 세션 ID
	 * @returns 다음 질문 정보
	 */
	async generateNextQuestion(
		previousAnswers: QuestionAnswer[],
		currentAnswer?: string,
		sessionId?: string
	): Promise<NextQuestionResponse> {
		const result = await generateNextQuestion(previousAnswers, currentAnswer);

		// 세션 ID 생성 (없으면 새로 생성)
		const newSessionId = sessionId || crypto.randomUUID();

		return {
			question: result.question,
			isComplete: result.isComplete,
			sessionId: newSessionId,
		};
	}

	/**
	 * 프로젝트 이름 추천
	 * @param projectDescription 프로젝트 설명
	 * @returns 프로젝트 이름 추천 목록
	 */
	async suggestProjectNames(
		projectDescription: string
	): Promise<ProjectNameSuggestionsResponse> {
		const suggestions = await suggestProjectNames(projectDescription);

		return {
			suggestions,
		};
	}
}


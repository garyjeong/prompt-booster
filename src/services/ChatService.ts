/**
 * Chat Service
 * 채팅 관련 비즈니스 로직 처리
 */

import { randomUUID } from 'crypto';
import { generateNextQuestion, suggestProjectNames } from '@/lib/openai-client';
import { validateInitialAnswer, INITIAL_CLARIFICATION_QUESTION } from '@/lib/answer-validation';
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
		// 세션 ID 생성 (없으면 새로 생성)
		const newSessionId = sessionId || randomUUID();

		// 첫 답변 유효성 검사 (무의미한 입력 차단)
		if (previousAnswers.length === 1) {
			const validation = validateInitialAnswer(previousAnswers[0]?.answer || '');
			if (!validation.isValid) {
				return {
					question: validation.followUpQuestion || INITIAL_CLARIFICATION_QUESTION,
					isComplete: false,
					sessionId: newSessionId,
				};
			}
		}

		const result = await generateNextQuestion(previousAnswers, currentAnswer);

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


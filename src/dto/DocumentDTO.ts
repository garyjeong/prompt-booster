/**
 * Document DTO
 * Document Entity와 API Request/Response 간 변환
 */

import type { Document, QuestionAnswer } from '@prisma/client';
import type { DocumentGenerationResponse } from '@/types/chat';
import type { QuestionAnswer as QuestionAnswerType } from '@/types/chat';

export class DocumentDTO {
	/**
	 * API Request를 Entity 생성 데이터로 변환
	 */
	static toCreateData(
		userId: string,
		title: string,
		markdown: string,
		questionAnswers: QuestionAnswerType[]
	) {
		return {
			userId,
			title,
			content: markdown,
			markdown,
			questionAnswers: questionAnswers.map((qa, index) => ({
				question: qa.question,
				answer: qa.answer,
				order: index + 1,
			})),
		};
	}

	/**
	 * Entity를 API Response로 변환
	 */
	static toResponse(document: Document & { questionAnswers?: QuestionAnswer[] }): DocumentGenerationResponse {
		return {
			documentId: document.id,
			title: document.title,
			markdown: document.markdown,
			content: document.content,
		};
	}

	/**
	 * Entity 목록을 API Response 목록으로 변환
	 */
	static toResponseList(
		documents: (Document & { questionAnswers?: QuestionAnswer[] })[]
	): DocumentGenerationResponse[] {
		return documents.map((doc) => this.toResponse(doc));
	}

	/**
	 * QuestionAnswer Entity를 타입으로 변환
	 */
	static questionAnswerToType(qa: QuestionAnswer): QuestionAnswerType {
		return {
			id: qa.id,
			question: qa.question,
			answer: qa.answer,
			order: qa.order,
			createdAt: qa.createdAt,
			updatedAt: qa.updatedAt,
		};
	}
}


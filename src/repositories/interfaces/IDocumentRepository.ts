/**
 * Document Repository 인터페이스
 * 문서 데이터 접근을 위한 추상화 계층
 */

import type { Document, QuestionAnswer } from '@prisma/client';

export interface DocumentWithRelations extends Document {
	questionAnswers: QuestionAnswer[];
}

export interface CreateDocumentData {
	userId: string;
	title: string;
	content: string;
	markdown: string;
	questionAnswers?: Array<{
		question: string;
		answer: string;
		order: number;
	}>;
}

export interface IDocumentRepository {
	/**
	 * ID로 문서 조회
	 * @param id 문서 ID
	 * @returns 문서 정보 또는 null
	 */
	findById(id: string): Promise<DocumentWithRelations | null>;

	/**
	 * 사용자 ID로 문서 목록 조회
	 * @param userId 사용자 ID
	 * @param limit 조회 개수 제한
	 * @param offset 건너뛸 개수
	 * @returns 문서 목록
	 */
	findByUserId(userId: string, limit?: number, offset?: number): Promise<Document[]>;

	/**
	 * 문서 생성
	 * @param data 문서 생성 데이터
	 * @returns 생성된 문서 정보
	 */
	create(data: CreateDocumentData): Promise<DocumentWithRelations>;

	/**
	 * 문서 업데이트
	 * @param id 문서 ID
	 * @param data 업데이트할 데이터
	 * @returns 업데이트된 문서 정보
	 */
	update(
		id: string,
		data: Partial<Pick<Document, 'title' | 'content' | 'markdown'>>
	): Promise<Document>;

	/**
	 * 문서 삭제
	 * @param id 문서 ID
	 */
	delete(id: string): Promise<void>;

	/**
	 * 문서 존재 여부 확인
	 * @param id 문서 ID
	 * @returns 존재 여부
	 */
	exists(id: string): Promise<boolean>;
}


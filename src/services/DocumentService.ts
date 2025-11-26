/**
 * Document Service
 * 문서 관련 비즈니스 로직 처리
 */

import { DocumentRepository } from '@/repositories/DocumentRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { generateDocument } from '@/lib/openai-client';
import { DocumentDTO } from '@/dto';
import type { QuestionAnswer } from '@/types/chat';
import type { DocumentGenerationResponse } from '@/types/chat';

export class DocumentService {
	private documentRepository: DocumentRepository;
	private userRepository: UserRepository;

	constructor(
		documentRepository?: DocumentRepository,
		userRepository?: UserRepository
	) {
		this.documentRepository = documentRepository ?? new DocumentRepository();
		this.userRepository = userRepository ?? new UserRepository();
	}

	/**
	 * 문서 생성
	 * @param userEmail 사용자 이메일
	 * @param questionAnswers 질문/답변 목록
	 * @returns 생성된 문서 정보
	 */
	async createDocument(
		userEmail: string,
		questionAnswers: QuestionAnswer[]
	): Promise<DocumentGenerationResponse> {
		// 사용자 조회 또는 생성 (개발 모드 지원)
		let user = await this.userRepository.findByEmail(userEmail);
		if (!user) {
			// 개발 모드: 사용자가 없으면 자동 생성
			if (userEmail === 'dev@localhost') {
				user = await this.userRepository.create({
					email: 'dev@localhost',
					name: 'Development User',
				});
			} else {
				throw new NotFoundError('사용자');
			}
		}

		// 문서 생성 (Gemini API 호출)
		const { title, markdown } = await generateDocument(questionAnswers);

		// DTO를 사용하여 Entity 생성 데이터 변환
		const createData = DocumentDTO.toCreateData(user.id, title, markdown, questionAnswers);

		// DB에 문서 저장
		const document = await this.documentRepository.create(createData);

		// DTO를 사용하여 Response 변환
		return DocumentDTO.toResponse(document);
	}

	/**
	 * 문서 조회
	 * @param documentId 문서 ID
	 * @param userEmail 사용자 이메일 (소유권 확인용)
	 * @returns 문서 정보
	 */
	async getDocument(documentId: string, userEmail: string): Promise<DocumentGenerationResponse> {
		// 사용자 조회
		const user = await this.userRepository.findByEmail(userEmail);
		if (!user) {
			throw new UnauthorizedError();
		}

		// 문서 조회
		const document = await this.documentRepository.findById(documentId);
		if (!document) {
			throw new NotFoundError('문서', documentId);
		}

		// 소유권 확인
		if (document.userId !== user.id) {
			throw new UnauthorizedError('이 문서에 접근할 권한이 없습니다.');
		}

		return DocumentDTO.toResponse(document);
	}

	/**
	 * 사용자의 문서 목록 조회
	 * @param userEmail 사용자 이메일
	 * @param limit 조회 개수 제한
	 * @param offset 건너뛸 개수
	 * @returns 문서 목록
	 */
	async getUserDocuments(
		userEmail: string,
		limit?: number,
		offset?: number
	): Promise<DocumentGenerationResponse[]> {
		// 사용자 조회
		const user = await this.userRepository.findByEmail(userEmail);
		if (!user) {
			throw new NotFoundError('사용자');
		}

		// 문서 목록 조회
		const documents = await this.documentRepository.findByUserId(user.id, limit, offset);

		return DocumentDTO.toResponseList(documents);
	}
}


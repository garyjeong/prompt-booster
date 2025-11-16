/**
 * 문서 생성 API 라우트 테스트
 */

import { POST } from '@/app/api/document/route';
import { DocumentService } from '@/services/DocumentService';
import { getServerSession } from 'next-auth';
import { getEnvConfig } from '@/config/env';
import { ValidationError } from '@/lib/errors';

// 모킹
jest.mock('@/services/DocumentService');
jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}));
jest.mock('@/config/env');

describe('/api/document', () => {
	let mockDocumentService: jest.Mocked<DocumentService>;

	beforeEach(() => {
		mockDocumentService = {
			createDocument: jest.fn(),
		} as any;

		(DocumentService as jest.MockedClass<typeof DocumentService>).mockImplementation(
			() => mockDocumentService
		);
		jest.clearAllMocks();
	});

	describe('POST', () => {
		it('환경 변수가 없으면 에러를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: undefined,
			});

			const request = new Request('http://localhost/api/document', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionAnswers: [],
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error.error).toContain('AI 서비스에 연결할 수 없습니다');
		});

		it('로그인한 사용자의 문서를 생성해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-1', email: 'test@example.com' },
			});

			mockDocumentService.createDocument.mockResolvedValue({
				documentId: 'doc-1',
				title: '테스트 문서',
				markdown: '# 테스트',
				content: '내용',
			});

			const request = new Request('http://localhost/api/document', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionAnswers: [
						{
							id: 'qa-1',
							question: '질문 1',
							answer: '답변 1',
							order: 1,
						},
					],
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(mockDocumentService.createDocument).toHaveBeenCalledWith(
				'test@example.com',
				expect.any(Array)
			);
		});

		it('로그인하지 않은 경우 dev@localhost로 생성해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			(getServerSession as jest.Mock).mockResolvedValue(null);

			mockDocumentService.createDocument.mockResolvedValue({
				documentId: 'doc-1',
				title: '테스트 문서',
				markdown: '# 테스트',
				content: '내용',
			});

			const request = new Request('http://localhost/api/document', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionAnswers: [
						{
							id: 'qa-1',
							question: '질문 1',
							answer: '답변 1',
							order: 1,
						},
					],
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(mockDocumentService.createDocument).toHaveBeenCalledWith(
				'dev@localhost',
				expect.any(Array)
			);
		});

		it('questionAnswers가 없으면 ValidationError를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			(getServerSession as jest.Mock).mockResolvedValue(null);

			const request = new Request('http://localhost/api/document', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});

		it('questionAnswers가 빈 배열이면 ValidationError를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			(getServerSession as jest.Mock).mockResolvedValue(null);

			const request = new Request('http://localhost/api/document', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionAnswers: [],
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});

		it('questionAnswers가 배열이 아니면 ValidationError를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			(getServerSession as jest.Mock).mockResolvedValue(null);

			const request = new Request('http://localhost/api/document', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionAnswers: 'not-an-array',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});
	});
});


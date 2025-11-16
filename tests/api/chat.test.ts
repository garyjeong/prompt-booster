/**
 * 채팅 API 라우트 테스트
 */

import { POST } from '@/app/api/chat/route';
import { ChatService } from '@/services/ChatService';
import { getEnvConfig } from '@/config/env';
import { ValidationError } from '@/lib/errors';

// 모킹
jest.mock('@/services/ChatService');
jest.mock('@/config/env');

describe('/api/chat', () => {
	let mockChatService: jest.Mocked<ChatService>;

	beforeEach(() => {
		mockChatService = {
			generateNextQuestion: jest.fn(),
		} as any;

		(ChatService as jest.MockedClass<typeof ChatService>).mockImplementation(() => mockChatService);
		jest.clearAllMocks();
	});

	describe('POST', () => {
		it('환경 변수가 없으면 에러를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: undefined,
			});

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					previousAnswers: [],
					currentAnswer: '테스트',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error.error).toContain('AI 서비스에 연결할 수 없습니다');
		});

		it('유효한 요청을 처리해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			mockChatService.generateNextQuestion.mockResolvedValue({
				question: '다음 질문',
				isComplete: false,
				sessionId: 'session-1',
			});

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					previousAnswers: [],
					currentAnswer: '테스트',
					sessionId: 'session-1',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data.question).toBe('다음 질문');
		});

		it('previousAnswers가 없으면 ValidationError를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentAnswer: '테스트',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});

		it('previousAnswers가 배열이 아니면 ValidationError를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				geminiApiKey: 'test-api-key',
			});

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					previousAnswers: 'not-an-array',
					currentAnswer: '테스트',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});
	});
});


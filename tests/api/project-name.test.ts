/**
 * 프로젝트 이름 추천 API 라우트 테스트
 */

import { POST } from '@/app/api/project-name/route';
import { ChatService } from '@/services/ChatService';
import { getEnvConfig } from '@/config/env';
import { ValidationError } from '@/lib/errors';

// 모킹
jest.mock('@/services/ChatService');
jest.mock('@/config/env');

describe('/api/project-name', () => {
	let mockChatService: jest.Mocked<ChatService>;

	beforeEach(() => {
		mockChatService = {
			suggestProjectNames: jest.fn(),
		} as any;

		(ChatService as jest.MockedClass<typeof ChatService>).mockImplementation(() => mockChatService);
		jest.clearAllMocks();
	});

	describe('POST', () => {
		it('환경 변수가 없으면 에러를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				openaiApiKey: undefined,
			});

			const request = new Request('http://localhost/api/project-name', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectDescription: '테스트 프로젝트',
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
				openaiApiKey: 'test-api-key',
			});

			mockChatService.suggestProjectNames.mockResolvedValue({
				suggestions: [
					{ name: 'Project1', description: '설명 1' },
					{ name: 'Project2', description: '설명 2' },
				],
			});

			const request = new Request('http://localhost/api/project-name', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectDescription: '테스트 프로젝트',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data.suggestions.length).toBe(2);
		});

		it('projectDescription가 없으면 ValidationError를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				openaiApiKey: 'test-api-key',
			});

			const request = new Request('http://localhost/api/project-name', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});

		it('projectDescription가 문자열이 아니면 ValidationError를 반환해야 함', async () => {
			(getEnvConfig as jest.Mock).mockReturnValue({
				openaiApiKey: 'test-api-key',
			});

			const request = new Request('http://localhost/api/project-name', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectDescription: 123,
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});
	});
});


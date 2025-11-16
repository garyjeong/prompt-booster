/**
 * 채팅 세션 API 라우트 테스트
 */

import { GET, POST } from '@/app/api/chat-sessions/route';
import { ChatSessionService } from '@/services/ChatSessionService';
import { getServerSession } from 'next-auth';
import { UnauthorizedError, ValidationError } from '@/lib/errors';

// 모킹
jest.mock('@/services/ChatSessionService');
jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}));

describe('/api/chat-sessions', () => {
	let mockChatSessionService: jest.Mocked<ChatSessionService>;

	beforeEach(() => {
		mockChatSessionService = {
			getSessionsByUserId: jest.fn(),
			saveSession: jest.fn(),
		} as any;

		(ChatSessionService as jest.MockedClass<typeof ChatSessionService>).mockImplementation(
			() => mockChatSessionService
		);
		jest.clearAllMocks();
	});

	describe('GET', () => {
		it('로그인한 사용자의 세션 목록을 반환해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-1', email: 'test@example.com' },
			});

			mockChatSessionService.getSessionsByUserId.mockResolvedValue([
				{
					id: 'db-id-1',
					sessionId: 'session-1',
					questionAnswers: [],
					isCompleted: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const request = new Request('http://localhost/api/chat-sessions?limit=10&offset=0');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(Array.isArray(data.data)).toBe(true);
		});

		it('로그인하지 않으면 UnauthorizedError를 반환해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue(null);

			const request = new Request('http://localhost/api/chat-sessions');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
		});
	});

	describe('POST', () => {
		it('세션을 저장해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-1', email: 'test@example.com' },
			});

			mockChatSessionService.saveSession.mockResolvedValue({
				id: 'db-id-1',
				sessionId: 'session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const sessionData = {
				sessionId: 'session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			const request = new Request('http://localhost/api/chat-sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(sessionData),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(mockChatSessionService.saveSession).toHaveBeenCalled();
		});

		it('sessionId가 없으면 ValidationError를 반환해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-1', email: 'test@example.com' },
			});

			const request = new Request('http://localhost/api/chat-sessions', {
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
	});
});


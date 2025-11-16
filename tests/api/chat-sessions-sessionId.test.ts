/**
 * 특정 채팅 세션 API 라우트 테스트
 */

import { GET, DELETE } from '@/app/api/chat-sessions/[sessionId]/route';
import { ChatSessionService } from '@/services/ChatSessionService';
import { getServerSession } from 'next-auth';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';

// 모킹
jest.mock('@/services/ChatSessionService');
jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}));

describe('/api/chat-sessions/[sessionId]', () => {
	let mockChatSessionService: jest.Mocked<ChatSessionService>;

	beforeEach(() => {
		mockChatSessionService = {
			getSessionBySessionId: jest.fn(),
			deleteSession: jest.fn(),
		} as any;

		(ChatSessionService as jest.MockedClass<typeof ChatSessionService>).mockImplementation(
			() => mockChatSessionService
		);
		jest.clearAllMocks();
	});

	describe('GET', () => {
		it('세션을 조회해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-1', email: 'test@example.com' },
			});

			const mockSession = {
				id: 'db-id-1',
				userId: 'user-1',
				sessionId: 'session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockChatSessionService.getSessionBySessionId.mockResolvedValue(mockSession);

			const request = new Request('http://localhost/api/chat-sessions/session-1');
			const response = await GET(request, {
				params: Promise.resolve({ sessionId: 'session-1' }),
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data.sessionId).toBe('session-1');
		});

		it('세션이 없으면 NotFoundError를 반환해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-1', email: 'test@example.com' },
			});

			mockChatSessionService.getSessionBySessionId.mockResolvedValue(null);

			const request = new Request('http://localhost/api/chat-sessions/non-existent');
			const response = await GET(request, {
				params: Promise.resolve({ sessionId: 'non-existent' }),
			});
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.success).toBe(false);
		});

		it('다른 사용자의 세션에 접근하면 UnauthorizedError를 반환해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-2', email: 'other@example.com' },
			});

			const mockSession = {
				id: 'db-id-1',
				userId: 'user-1', // 다른 사용자
				sessionId: 'session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockChatSessionService.getSessionBySessionId.mockResolvedValue(mockSession);

			const request = new Request('http://localhost/api/chat-sessions/session-1');
			const response = await GET(request, {
				params: Promise.resolve({ sessionId: 'session-1' }),
			});
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
		});
	});

	describe('DELETE', () => {
		it('세션을 삭제해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-1', email: 'test@example.com' },
			});

			const mockSession = {
				id: 'db-id-1',
				userId: 'user-1',
				sessionId: 'session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockChatSessionService.getSessionBySessionId.mockResolvedValue(mockSession);
			mockChatSessionService.deleteSession.mockResolvedValue(undefined);

			const request = new Request('http://localhost/api/chat-sessions/session-1', {
				method: 'DELETE',
			});
			const response = await DELETE(request, {
				params: Promise.resolve({ sessionId: 'session-1' }),
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(mockChatSessionService.deleteSession).toHaveBeenCalledWith('session-1');
		});

		it('다른 사용자의 세션을 삭제하면 UnauthorizedError를 반환해야 함', async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { id: 'user-2', email: 'other@example.com' },
			});

			const mockSession = {
				id: 'db-id-1',
				userId: 'user-1', // 다른 사용자
				sessionId: 'session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockChatSessionService.getSessionBySessionId.mockResolvedValue(mockSession);

			const request = new Request('http://localhost/api/chat-sessions/session-1', {
				method: 'DELETE',
			});
			const response = await DELETE(request, {
				params: Promise.resolve({ sessionId: 'session-1' }),
			});
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
		});
	});
});


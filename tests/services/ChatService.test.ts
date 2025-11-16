/**
 * ChatService 테스트
 */

import { ChatService } from '@/services/ChatService';
import { generateNextQuestion, suggestProjectNames } from '@/lib/gemini-client';
import type { QuestionAnswer } from '@/types/chat';

// Gemini 클라이언트 모킹
jest.mock('@/lib/gemini-client', () => ({
	generateNextQuestion: jest.fn(),
	suggestProjectNames: jest.fn(),
}));

describe('ChatService', () => {
	let service: ChatService;

	beforeEach(() => {
		service = new ChatService();
		jest.clearAllMocks();
	});

	describe('generateNextQuestion', () => {
		it('다음 질문을 생성해야 함', async () => {
			const previousAnswers: QuestionAnswer[] = [
				{
					id: 'qa-1',
					question: '무엇을 만들어보고 싶으신가요?',
					answer: '온라인 쇼핑몰',
					order: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			(generateNextQuestion as jest.Mock).mockResolvedValue({
				question: '어떤 기능이 필요하신가요?',
				isComplete: false,
			});

			const result = await service.generateNextQuestion(previousAnswers, '온라인 쇼핑몰', 'session-1');

			expect(generateNextQuestion).toHaveBeenCalledWith(previousAnswers, '온라인 쇼핑몰');
			expect(result.question).toBe('어떤 기능이 필요하신가요?');
			expect(result.isComplete).toBe(false);
			expect(result.sessionId).toBe('session-1');
		});

		it('세션 ID가 없으면 새로 생성해야 함', async () => {
			const previousAnswers: QuestionAnswer[] = [];

			(generateNextQuestion as jest.Mock).mockResolvedValue({
				question: '무엇을 만들어보고 싶으신가요?',
				isComplete: false,
			});

			const result = await service.generateNextQuestion(previousAnswers);

			expect(result.sessionId).toBeTruthy();
			expect(typeof result.sessionId).toBe('string');
		});

		it('완료 질문을 처리해야 함', async () => {
			const previousAnswers: QuestionAnswer[] = [];

			(generateNextQuestion as jest.Mock).mockResolvedValue({
				question: '문서 생성을 시작하시겠습니까?',
				isComplete: true,
			});

			const result = await service.generateNextQuestion(previousAnswers);

			expect(result.isComplete).toBe(true);
		});
	});

	describe('suggestProjectNames', () => {
		it('프로젝트 이름을 추천해야 함', async () => {
			const projectDescription = '온라인 쇼핑몰 프로젝트';

			(suggestProjectNames as jest.Mock).mockResolvedValue([
				{ name: 'ShopEasy', description: '쉬운 쇼핑 경험' },
				{ name: 'MallPro', description: '전문 쇼핑몰' },
				{ name: 'BuyNow', description: '즉시 구매' },
			]);

			const result = await service.suggestProjectNames(projectDescription);

			expect(suggestProjectNames).toHaveBeenCalledWith(projectDescription);
			expect(result.suggestions.length).toBe(3);
			expect(result.suggestions[0].name).toBe('ShopEasy');
		});
	});
});


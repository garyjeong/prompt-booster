/**
 * API Route 테스트: /api/improve
 */

import { POST, GET } from "@/app/api/improve/route";
import { NextRequest } from "next/server";
import type {
	PromptImprovementRequest,
	APIResponse,
	PromptImprovementResponse,
} from "@/types/api";

// Mock OpenAI
jest.mock("openai", () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(() => ({
		chat: {
			completions: {
				create: jest.fn().mockResolvedValue({
					choices: [
						{
							message: {
								content:
									"개선된 프롬프트: 리액트에서 useState 훅을 사용하여 상태 관리를 하는 방법을 단계별로 설명해주세요.",
							},
						},
					],
				}),
			},
		},
	})),
}));

// Mock Google Generative AI
jest.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
		getGenerativeModel: jest.fn().mockReturnValue({
			generateContent: jest.fn().mockResolvedValue({
				response: {
					text: jest
						.fn()
						.mockResolvedValue(
							"개선된 프롬프트: 리액트에서 useState 훅을 사용하여 상태 관리를 하는 방법을 자세히 알려주세요."
						),
				},
			}),
		}),
	})),
}));

describe("/api/improve", () => {
	beforeEach(() => {
		// 환경변수 설정
		process.env.OPENAI_API_KEY = "test-openai-key";
		process.env.GEMINI_API_KEY = "test-gemini-key";
	});

	describe("GET", () => {
		it("should return API status information", async () => {
			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual({
				success: true,
				data: {
					status: "OK",
					endpoint: "/api/improve",
					methods: ["POST"],
					version: "1.0.0",
				},
			});
		});
	});

	describe("POST", () => {
		const createMockRequest = (body: any): NextRequest => {
			return new NextRequest("http://localhost:3000/api/improve", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});
		};

		it("should improve prompt using OpenAI when environment key is available", async () => {
			const requestBody: PromptImprovementRequest = {
				prompt: "리액트에서 useState를 사용하는 방법을 알려줘",
				provider: "openai",
			};

			const request = createMockRequest(requestBody);
			const response = await POST(request);
			const data: APIResponse<PromptImprovementResponse> =
				await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			if (data.success) {
				expect(data.data.improvedPrompt).toContain("개선된 프롬프트");
				expect(data.data.provider).toBe("openai");
				expect(data.data.originalPrompt).toBe(requestBody.prompt);
				expect(typeof data.data.processingTime).toBe("number");
			}
		});

		it("should improve prompt using Gemini when environment key is available", async () => {
			const requestBody: PromptImprovementRequest = {
				prompt: "리액트에서 useState를 사용하는 방법을 알려줘",
				provider: "gemini",
			};

			const request = createMockRequest(requestBody);
			const response = await POST(request);
			const data: APIResponse<PromptImprovementResponse> =
				await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			if (data.success) {
				expect(data.data.improvedPrompt).toContain("개선된 프롬프트");
				expect(data.data.provider).toBe("gemini");
				expect(data.data.originalPrompt).toBe(requestBody.prompt);
				expect(typeof data.data.processingTime).toBe("number");
			}
		});

		it("should work without provider specified (auto-select)", async () => {
			const requestBody: PromptImprovementRequest = {
				prompt: "리액트에서 useState를 사용하는 방법을 알려줘",
			};

			const request = createMockRequest(requestBody);
			const response = await POST(request);
			const data: APIResponse<PromptImprovementResponse> =
				await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			if (data.success) {
				expect(data.data.improvedPrompt).toContain("개선된 프롬프트");
				expect(["openai", "gemini"]).toContain(data.data.provider);
			}
		});

		it("should work with user-provided API keys as fallback", async () => {
			// 환경변수 제거
			delete process.env.OPENAI_API_KEY;
			delete process.env.GEMINI_API_KEY;

			const requestBody: PromptImprovementRequest = {
				prompt: "리액트에서 useState를 사용하는 방법을 알려줘",
				openaiKey: "user-provided-openai-key",
				provider: "openai",
			};

			const request = createMockRequest(requestBody);
			const response = await POST(request);
			const data: APIResponse<PromptImprovementResponse> =
				await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			if (data.success) {
				expect(data.data.provider).toBe("openai");
			}

			// 환경변수 복원
			process.env.OPENAI_API_KEY = "test-openai-key";
			process.env.GEMINI_API_KEY = "test-gemini-key";
		});

		it("should return 400 for invalid request body", async () => {
			const request = createMockRequest({});
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error.error).toContain("프롬프트가 제공되지 않았습니다");
		});

		it("should return 400 for empty prompt", async () => {
			const requestBody = {
				prompt: "",
			};

			const request = createMockRequest(requestBody);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error.error).toContain("빈 프롬프트는 개선할 수 없습니다");
		});

		it("should return 400 for too long prompt", async () => {
			const requestBody = {
				prompt: "a".repeat(2001), // 2000자 초과
			};

			const request = createMockRequest(requestBody);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error.error).toContain("프롬프트가 너무 깁니다");
		});

		it("should return 500 when no API keys are available", async () => {
			// 환경변수와 사용자 키 모두 제거
			delete process.env.OPENAI_API_KEY;
			delete process.env.GEMINI_API_KEY;

			const requestBody: PromptImprovementRequest = {
				prompt: "리액트에서 useState를 사용하는 방법을 알려줘",
			};

			const request = createMockRequest(requestBody);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error.error).toContain("사용 가능한 API 키가 없습니다");

			// 환경변수 복원
			process.env.OPENAI_API_KEY = "test-openai-key";
			process.env.GEMINI_API_KEY = "test-gemini-key";
		});
	});
});

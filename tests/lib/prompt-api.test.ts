/**
 * 프롬프트 개선 API 로직 테스트
 * 순수 함수들을 직접 테스트
 */

import {
	improveWithGemini,
	validateRequest,
	getGeminiApiKey,
	processPromptImprovement,
	getApiStatus,
} from "@/lib/prompt-api";
import type { PromptImprovementRequest } from "@/types/api";

// Fetch API 모킹
global.fetch = jest.fn();

describe("Prompt API Logic", () => {
	beforeEach(() => {
		// 환경변수 설정
		process.env.GEMINI_API_KEY = "test-gemini-key";

		// Fetch 모킹 - Gemini API
		(global.fetch as jest.Mock).mockImplementation(async (url: string) => {
			if (url.includes("generativelanguage.googleapis.com")) {
				return {
					ok: true,
					json: async () => ({
						candidates: [
							{
								content: {
									parts: [{ text: "개선된 프롬프트 내용 (Gemini)" }],
								},
							},
						],
					}),
				};
			}
			throw new Error("Unknown API");
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete process.env.GEMINI_API_KEY;
	});

	describe("getApiStatus", () => {
		it("should return correct API status information", () => {
			const status = getApiStatus();

			expect(status).toEqual({
				status: "OK",
				endpoint: "/api/improve",
				methods: ["POST"],
				provider: "gemini",
				version: "1.0.0",
			});
		});
	});

	describe("validateRequest", () => {
		it("should return valid for proper request", () => {
			const request = { prompt: "테스트 프롬프트" };
			const result = validateRequest(request);

			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("should return invalid for missing object", () => {
			const result = validateRequest(null);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe("잘못된 요청 형식입니다.");
		});

		it("should return invalid for missing prompt", () => {
			const request = { notPrompt: "test" };
			const result = validateRequest(request);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe("프롬프트가 필요합니다.");
		});

		it("should return invalid for empty prompt", () => {
			const request = { prompt: "   " };
			const result = validateRequest(request);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe("빈 프롬프트는 개선할 수 없습니다.");
		});

		it("should return invalid for too long prompt", () => {
			const request = { prompt: "a".repeat(2001) };
			const result = validateRequest(request);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe("프롬프트가 너무 깁니다. (최대 2000자)");
		});
	});

	describe("getGeminiApiKey", () => {
		it("should return environment key when available", () => {
			const request: PromptImprovementRequest = {
				prompt: "test",
				geminiKey: "user-key",
			};

			const result = getGeminiApiKey(request);

			expect(result).toBe("test-gemini-key");
		});

		it("should return user key as fallback", () => {
			delete process.env.GEMINI_API_KEY;

			const request: PromptImprovementRequest = {
				prompt: "test",
				geminiKey: "user-gemini-key",
			};

			const result = getGeminiApiKey(request);

			expect(result).toBe("user-gemini-key");
		});

		it("should throw error when no keys available", () => {
			delete process.env.GEMINI_API_KEY;

			const request: PromptImprovementRequest = {
				prompt: "test",
			};

			expect(() => getGeminiApiKey(request)).toThrow(
				"Gemini API 키가 없습니다"
			);
		});
	});

	describe("improveWithGemini", () => {
		it("should improve prompt successfully", async () => {
			const result = await improveWithGemini("테스트 프롬프트", "test-key");

			expect(result).toBe("개선된 프롬프트 내용 (Gemini)");
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("generativelanguage.googleapis.com"),
				expect.any(Object)
			);
		});

		it("should handle API errors", async () => {
			(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

			await expect(
				improveWithGemini("테스트 프롬프트", "test-key")
			).rejects.toThrow("Gemini API 요청 실패");
		});

		it("should handle empty response", async () => {
			(global.fetch as jest.Mock).mockImplementation(async () => ({
				ok: true,
				json: async () => ({
					candidates: [
						{
							content: {
								parts: [{ text: "" }],
							},
						},
					],
				}),
			}));

			await expect(
				improveWithGemini("테스트 프롬프트", "test-key")
			).rejects.toThrow("개선된 프롬프트를 생성할 수 없습니다");
		});
	});

	describe("processPromptImprovement", () => {
		it("should process improvement successfully", async () => {
			const request: PromptImprovementRequest = {
				prompt: "리액트에서 useState 훅을 사용하는 방법",
			};

			const result = await processPromptImprovement(request);

			expect(result.improvedPrompt).toBe("개선된 프롬프트 내용 (Gemini)");
			expect(result.provider).toBe("gemini");
			expect(result.originalPrompt).toBe(request.prompt);
			expect(result.processingTime).toBeGreaterThanOrEqual(0);
		});

		it("should handle validation errors", async () => {
			const request: PromptImprovementRequest = {
				prompt: "",
			};

			await expect(processPromptImprovement(request)).rejects.toThrow(
				"프롬프트가 필요합니다"
			);
		});

		it("should fallback to demo mode when API key is missing", async () => {
			delete process.env.GEMINI_API_KEY;

			const request: PromptImprovementRequest = {
				prompt: "테스트",
			};

			const result = await processPromptImprovement(request);
			expect(result.isDemoMode).toBe(true);
			expect(["demo", "demo-fallback"]).toContain(result.provider);
			expect(result.improvedPrompt).toBeTruthy();
		});

		it("should work with user-provided key", async () => {
			delete process.env.GEMINI_API_KEY;

			const request: PromptImprovementRequest = {
				prompt: "사용자 키로 테스트",
				geminiKey: "user-gemini-key",
			};

			const result = await processPromptImprovement(request);

			expect(result.improvedPrompt).toBe("개선된 프롬프트 내용 (Gemini)");
			expect(result.provider).toBe("gemini");
		});
	});
});

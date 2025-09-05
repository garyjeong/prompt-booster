/**
 * API Key 통합 테스트
 * 실제 API 호출을 통해 API Key가 올바르게 작동하는지 테스트
 *
 * 주의: 이 테스트는 실제 API 비용이 발생할 수 있습니다.
 * CI/CD에서는 SKIP_INTEGRATION_TESTS=true 환경변수로 건너뛸 수 있습니다.
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 통합 테스트 건너뛰기 조건
const SKIP_TESTS =
	process.env.SKIP_INTEGRATION_TESTS === "true" ||
	process.env.NODE_ENV === "test";

describe("API Keys Integration Tests", () => {
	beforeAll(() => {
		if (SKIP_TESTS) {
			console.log(
				"⏭️ Skipping integration tests (SKIP_INTEGRATION_TESTS=true or NODE_ENV=test)"
			);
		}
	});

	describe("OpenAI API Key", () => {
		const openaiKey = process.env.OPENAI_API_KEY;

		it("should be configured in environment", () => {
			if (SKIP_TESTS) return;

			expect(openaiKey).toBeDefined();
			expect(openaiKey).toMatch(/^sk-/);
			expect(openaiKey!.length).toBeGreaterThan(20);
		});

		it("should successfully call OpenAI API", async () => {
			if (SKIP_TESTS) return;

			const openai = new OpenAI({
				apiKey: openaiKey,
			});

			const completion = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content: "You are a helpful assistant that improves prompts.",
					},
					{
						role: "user",
						content:
							'다음 프롬프트를 개선해주세요: "자바스크립트 변수 설명해줘"',
					},
				],
				max_tokens: 100,
				temperature: 0.7,
			});

			expect(completion.choices).toBeDefined();
			expect(completion.choices.length).toBeGreaterThan(0);
			expect(completion.choices[0].message.content).toBeTruthy();
			expect(typeof completion.choices[0].message.content).toBe("string");

			console.log(
				"✅ OpenAI API Response:",
				completion.choices[0].message.content?.substring(0, 100)
			);
		}, 30000); // 30초 타임아웃

		it("should handle invalid API key gracefully", async () => {
			if (SKIP_TESTS) return;

			const openai = new OpenAI({
				apiKey: "sk-invalid-key-for-testing",
			});

			await expect(
				openai.chat.completions.create({
					model: "gpt-3.5-turbo",
					messages: [{ role: "user", content: "test" }],
					max_tokens: 10,
				})
			).rejects.toThrow();
		}, 15000);
	});

	describe("Google Gemini API Key", () => {
		const geminiKey = process.env.GEMINI_API_KEY;

		it("should be configured in environment", () => {
			if (SKIP_TESTS) return;

			expect(geminiKey).toBeDefined();
			expect(geminiKey!.length).toBeGreaterThan(10);
		});

		it("should successfully call Gemini API", async () => {
			if (SKIP_TESTS) return;

			const genAI = new GoogleGenerativeAI(geminiKey!);
			const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

			const result = await model.generateContent([
				"You are a helpful assistant that improves prompts.",
				'다음 프롬프트를 개선해주세요: "파이썬 함수 만드는 법 알려줘"',
			]);

			const response = await result.response;
			const text = response.text();

			expect(text).toBeTruthy();
			expect(typeof text).toBe("string");
			expect(text.length).toBeGreaterThan(10);

			console.log("✅ Gemini API Response:", text.substring(0, 100));
		}, 30000); // 30초 타임아웃

		it("should handle invalid API key gracefully", async () => {
			if (SKIP_TESTS) return;

			const genAI = new GoogleGenerativeAI("invalid-key-for-testing");
			const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

			await expect(model.generateContent(["test prompt"])).rejects.toThrow();
		}, 15000);
	});

	describe("API Performance Tests", () => {
		it("should respond within reasonable time limits", async () => {
			if (SKIP_TESTS) return;

			const openaiKey = process.env.OPENAI_API_KEY;
			const openai = new OpenAI({ apiKey: openaiKey });

			const startTime = Date.now();

			await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [{ role: "user", content: "Hello" }],
				max_tokens: 10,
			});

			const responseTime = Date.now() - startTime;

			expect(responseTime).toBeLessThan(10000); // 10초 이내
			console.log(`✅ API Response time: ${responseTime}ms`);
		}, 15000);

		it("should handle concurrent requests", async () => {
			if (SKIP_TESTS) return;

			const openaiKey = process.env.OPENAI_API_KEY;
			const openai = new OpenAI({ apiKey: openaiKey });

			const promises = Array(3)
				.fill(null)
				.map((_, i) =>
					openai.chat.completions.create({
						model: "gpt-3.5-turbo",
						messages: [{ role: "user", content: `Test ${i}` }],
						max_tokens: 10,
					})
				);

			const results = await Promise.all(promises);

			expect(results).toHaveLength(3);
			results.forEach((result) => {
				expect(result.choices[0].message.content).toBeTruthy();
			});

			console.log("✅ Concurrent requests completed successfully");
		}, 30000);
	});
});

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
	PromptImprovementRequest,
	PromptImprovementResponse,
	APIError,
	AIProvider,
} from "@/types/api";

/** 프롬프트 개선을 위한 시스템 메시지 */
const SYSTEM_PROMPT = `You are an expert prompt engineer. Your task is to improve user prompts to get better responses from AI coding assistants.

Transform the user's prompt by:
1. Adding clear context and requirements
2. Specifying the desired output format
3. Including relevant constraints or considerations
4. Making the request more structured and actionable

Guidelines:
- Make prompts more specific and detailed
- Add context about the programming language, framework, or domain
- Specify expected output format (code, explanation, examples)
- Include error handling, testing, or performance considerations when relevant
- Maintain the original intent while making it more effective

Return only the improved prompt in Korean, without any additional explanation or meta-text.`;

/** OpenAI를 사용한 프롬프트 개선 */
async function improveWithOpenAI(
	prompt: string,
	apiKey: string
): Promise<string> {
	const openai = new OpenAI({
		apiKey: apiKey,
	});

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4-turbo",
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: `다음 프롬프트를 개선해주세요: "${prompt}"` },
			],
			max_tokens: 1000,
			temperature: 0.7,
		});

		return (
			completion.choices[0]?.message?.content || "프롬프트 개선에 실패했습니다."
		);
	} catch (error) {
		// GPT-4 실패 시 GPT-3.5로 fallback
		try {
			const fallbackCompletion = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [
					{ role: "system", content: SYSTEM_PROMPT },
					{
						role: "user",
						content: `다음 프롬프트를 개선해주세요: "${prompt}"`,
					},
				],
				max_tokens: 1000,
				temperature: 0.7,
			});

			return (
				fallbackCompletion.choices[0]?.message?.content ||
				"프롬프트 개선에 실패했습니다."
			);
		} catch (fallbackError) {
			console.error("OpenAI API 호출 실패:", fallbackError);
			throw new Error("OpenAI API 호출에 실패했습니다.");
		}
	}
}

/** Google Gemini를 사용한 프롬프트 개선 */
async function improveWithGemini(
	prompt: string,
	apiKey: string
): Promise<string> {
	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

	try {
		const result = await model.generateContent([
			SYSTEM_PROMPT,
			`다음 프롬프트를 개선해주세요: "${prompt}"`,
		]);

		const response = await result.response;
		return response.text() || "프롬프트 개선에 실패했습니다.";
	} catch (error) {
		console.error("Gemini API 호출 실패:", error);
		throw new Error("Gemini API 호출에 실패했습니다.");
	}
}

/** 요청 유효성 검증 */
function validateRequest(body: unknown): { isValid: boolean; error?: string } {
	// 타입 가드: body가 객체인지 확인
	if (!body || typeof body !== "object") {
		return { isValid: false, error: "유효하지 않은 요청 형식입니다." };
	}

	const request = body as Record<string, unknown>;

	if (!request.prompt || typeof request.prompt !== "string") {
		return { isValid: false, error: "프롬프트가 제공되지 않았습니다." };
	}

	if (request.prompt.trim().length === 0) {
		return { isValid: false, error: "빈 프롬프트는 개선할 수 없습니다." };
	}

	if (request.prompt.length > 2000) {
		return { isValid: false, error: "프롬프트가 너무 깁니다. (최대 2000자)" };
	}

	if (!request.openaiKey && !request.geminiKey) {
		return { isValid: false, error: "OpenAI 또는 Gemini API 키가 필요합니다." };
	}

	return { isValid: true };
}

/** 사용할 프로바이더 결정 */
function determineProvider(body: PromptImprovementRequest): AIProvider {
	// 사용자가 명시적으로 프로바이더를 선택한 경우
	if (body.provider) {
		if (body.provider === "openai" && body.openaiKey) return "openai";
		if (body.provider === "gemini" && body.geminiKey) return "gemini";
	}

	// 기본 우선순위: OpenAI > Gemini
	if (body.openaiKey) return "openai";
	if (body.geminiKey) return "gemini";

	// 이 시점에서는 validation에서 걸러져야 함
	throw new Error("사용 가능한 API 키가 없습니다.");
}

/** POST 요청 핸들러 */
export async function POST(request: NextRequest) {
	const startTime = Date.now();

	try {
		const body: PromptImprovementRequest = await request.json();

		// 요청 유효성 검증
		const validation = validateRequest(body);
		if (!validation.isValid) {
			const errorResponse: APIError = {
				error: validation.error!,
				code: "INVALID_REQUEST",
			};
			return NextResponse.json(
				{ success: false, error: errorResponse },
				{ status: 400 }
			);
		}

		// 사용할 프로바이더 결정
		const provider = determineProvider(body);

		// 프롬프트 개선 실행
		let improvedPrompt: string;

		if (provider === "openai" && body.openaiKey) {
			improvedPrompt = await improveWithOpenAI(body.prompt, body.openaiKey);
		} else if (provider === "gemini" && body.geminiKey) {
			improvedPrompt = await improveWithGemini(body.prompt, body.geminiKey);
		} else {
			throw new Error("유효한 API 키가 없습니다.");
		}

		const processingTime = Date.now() - startTime;

		const response: PromptImprovementResponse = {
			improvedPrompt,
			provider,
			originalPrompt: body.prompt,
			processingTime,
		};

		return NextResponse.json({ success: true, data: response });
	} catch (error) {
		console.error("프롬프트 개선 API 에러:", error);

		const errorResponse: APIError = {
			error:
				error instanceof Error
					? error.message
					: "알 수 없는 오류가 발생했습니다.",
			code: "INTERNAL_ERROR",
			details: error instanceof Error ? error.stack : undefined,
		};

		return NextResponse.json(
			{ success: false, error: errorResponse },
			{ status: 500 }
		);
	}
}

/** GET 요청 핸들러 (API 상태 확인용) */
export async function GET() {
	return NextResponse.json({
		success: true,
		data: {
			status: "OK",
			endpoint: "/api/improve",
			methods: ["POST"],
			version: "1.0.0",
		},
	});
}

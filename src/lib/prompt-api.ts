/**
 * 프롬프트 개선 API 로직 모듈
 * NextRequest/NextResponse와 분리하여 테스트 가능한 순수 함수들
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
	PromptImprovementRequest,
	PromptImprovementResponse,
	AIProvider,
} from "@/types/api";
import { ScoringService } from "@/lib/scoring/ScoringService";
import type { PromptComparisonAnalysis } from "@/types/scoring";
import {
	improvePromptInDemoMode,
	isDemoModeRequired,
} from "@/lib/demo-prompt-improver";

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

/** Google Gemini를 사용한 프롬프트 개선 */
export async function improveWithGemini(
	prompt: string,
	apiKey: string
): Promise<string> {
	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		const result = await model.generateContent(
			`${SYSTEM_PROMPT}\n\n개선할 프롬프트:\n${prompt}`
		);
		const response = await result.response;
		const improvedPrompt = response.text();

		if (!improvedPrompt || improvedPrompt.trim().length === 0) {
			throw new Error("개선된 프롬프트를 생성할 수 없습니다.");
		}

		return improvedPrompt.trim();
	} catch (error) {
		console.error("Gemini API 에러:", error);
		throw new Error(
			`Gemini API 요청 실패: ${
				error instanceof Error ? error.message : "알 수 없는 오류"
			}`
		);
	}
}

/** 요청 데이터 유효성 검증 */
export function validateRequest(request: unknown): {
	isValid: boolean;
	error?: string;
} {
	if (!request || typeof request !== "object") {
		return { isValid: false, error: "잘못된 요청 형식입니다." };
	}

	// 타입 가드를 통한 안전한 속성 접근
	const requestObj = request as Record<string, unknown>;

	if (!requestObj.prompt || typeof requestObj.prompt !== "string") {
		return { isValid: false, error: "프롬프트가 필요합니다." };
	}

	if (requestObj.prompt.trim().length === 0) {
		return { isValid: false, error: "빈 프롬프트는 개선할 수 없습니다." };
	}

	if (requestObj.prompt.length > 2000) {
		return { isValid: false, error: "프롬프트가 너무 깁니다. (최대 2000자)" };
	}

	return { isValid: true };
}

/** Gemini API 키 확인 및 반환 */
export function getGeminiApiKey(body: PromptImprovementRequest): string {
	const geminiKey = process.env.GEMINI_API_KEY || body.geminiKey;

	if (!geminiKey) {
		throw new Error(
			"Gemini API 키가 없습니다. 환경변수 또는 요청에 API 키를 포함해주세요."
		);
	}

	return geminiKey;
}

/** 프롬프트 개선 메인 로직 (점수화 포함) */
export async function processPromptImprovement(
	request: PromptImprovementRequest
): Promise<
	PromptImprovementResponse & {
		scoringAnalysis?: PromptComparisonAnalysis;
		isDemoMode?: boolean;
	}
> {
	const startTime = Date.now();

	// 요청 유효성 검증
	const validation = validateRequest(request);
	if (!validation.isValid) {
		throw new Error(validation.error!);
	}

	let improvedPrompt: string;
	let provider: AIProvider;
	let isDemoMode = false;

	try {
		// Gemini API 키 확인
		const geminiKey = getGeminiApiKey(request);

		// API 키가 유효한지 체크하고 Demo 모드 필요 여부 판단
		if (isDemoModeRequired(geminiKey)) {
			console.log("🎭 Demo 모드로 전환: API 키가 없습니다.");
			const demoResult = await improvePromptInDemoMode(request.prompt);
			improvedPrompt = demoResult.improvedPrompt;
			provider = "demo";
			isDemoMode = true;
		} else {
			// Gemini API를 통한 프롬프트 개선 시도
			improvedPrompt = await improveWithGemini(request.prompt, geminiKey);
			provider = "gemini";
		}
	} catch (apiError) {
		console.warn("🚨 API 호출 실패, Demo 모드로 fallback:", apiError);

		// API 오류 시 Demo 모드로 fallback
		const demoResult = await improvePromptInDemoMode(request.prompt);
		improvedPrompt = demoResult.improvedPrompt;
		provider = "demo-fallback";
		isDemoMode = true;
	}

	const processingTime = Date.now() - startTime;

	// 기본 응답 객체 생성
	const response: PromptImprovementResponse & { isDemoMode?: boolean } = {
		improvedPrompt,
		provider,
		originalPrompt: request.prompt,
		processingTime,
		isDemoMode,
	};

	// 점수화 시스템 활성화 시 분석 수행 (Demo 모드에서도 동작)
	let scoringAnalysis: PromptComparisonAnalysis | undefined;
	if (process.env.ENABLE_IMPROVEMENT_SCORING === "true") {
		try {
			const scoringService = new ScoringService();
			scoringAnalysis = await scoringService.analyzeImprovement(
				request.prompt,
				improvedPrompt,
				request.scoringConfig
			);

			// 점수 히스토리에 저장
			await scoringService.saveScore(scoringAnalysis);

			const modeIndicator = isDemoMode ? "🎭 Demo" : "🤖 AI";
			console.log(
				`📊 ${modeIndicator} 개선 점수: ${(
					scoringAnalysis.improvementScore.overallScore * 100
				).toFixed(1)}점 (${scoringAnalysis.improvementScore.grade})`
			);
		} catch (scoringError) {
			console.warn("점수화 처리 실패:", scoringError);
			// 점수화 실패는 전체 프로세스를 중단시키지 않음
		}
	}

	return {
		...response,
		scoringAnalysis,
	};
}

/** API 상태 정보 */
export function getApiStatus() {
	return {
		status: "OK",
		endpoint: "/api/improve",
		methods: ["POST"],
		provider: "gemini",
		version: "1.0.0",
	};
}

import { NextRequest, NextResponse } from "next/server";
import type { PromptImprovementRequest, APIError } from "@/types/api";
import { processPromptImprovement, getApiStatus } from "@/lib/prompt-api";

/** POST 요청 핸들러 */
export async function POST(request: NextRequest) {
	try {
		const body: PromptImprovementRequest = await request.json();
		const response = await processPromptImprovement(body);
		return NextResponse.json({ success: true, data: response });
	} catch (error) {
		console.error("프롬프트 개선 API 에러:", error);

		const errorResponse: APIError = {
			error:
				error instanceof Error
					? error.message
					: "알 수 없는 오류가 발생했습니다.",
			code:
				error instanceof Error && error.message.includes("API 키")
					? "INTERNAL_ERROR"
					: error instanceof Error &&
					  (error.message.includes("잘못된 요청") ||
							error.message.includes("프롬프트가 필요") ||
							error.message.includes("빈 프롬프트") ||
							error.message.includes("너무 깁니다"))
					? "INVALID_REQUEST"
					: "INTERNAL_ERROR",
			details: error instanceof Error ? error.stack : undefined,
		};

		const status = errorResponse.code === "INVALID_REQUEST" ? 400 : 500;

		return NextResponse.json(
			{ success: false, error: errorResponse },
			{ status }
		);
	}
}

/** GET 요청 핸들러 (API 상태 확인용) */
export async function GET() {
	return NextResponse.json({
		success: true,
		data: getApiStatus(),
	});
}

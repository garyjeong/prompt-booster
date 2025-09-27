import { NextRequest, NextResponse } from "next/server";
import type { ScoringConfig } from "@/types/scoring";

// 기본 설정은 서버 사이드 메모리에 유지 (데모 목적). 실제 서비스는 DB/kv 권장
let serverScoringConfigOverride: Partial<ScoringConfig> | undefined;

/** GET /api/scoring/config - 현재 점수화 설정 조회 */
export async function GET() {
	return NextResponse.json({
		success: true,
		data: serverScoringConfigOverride || null,
	});
}

/** POST /api/scoring/config - 점수화 설정 업데이트 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as Partial<ScoringConfig>;
		if (!body || typeof body !== "object") {
			return NextResponse.json(
				{
					success: false,
					error: { error: "잘못된 요청 형식입니다.", code: "INVALID_REQUEST" },
				},
				{ status: 400 }
			);
		}

		// 최소 검증: weights 합 1.0 ± 0.01
		if (body.weights) {
			const sum = Object.values(body.weights).reduce(
				(s, w) => s + (w as number),
				0
			);
			if (Math.abs(sum - 1.0) > 0.01) {
				return NextResponse.json(
					{
						success: false,
						error: {
							error: `가중치 합은 1.0이어야 합니다. 현재: ${sum}`,
							code: "INVALID_REQUEST",
						},
					},
					{ status: 400 }
				);
			}
		}

		serverScoringConfigOverride = body;
		return NextResponse.json({
			success: true,
			data: serverScoringConfigOverride,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: {
					error: error instanceof Error ? error.message : "알 수 없는 오류",
					code: "INTERNAL_ERROR",
					details: error instanceof Error ? error.stack : undefined,
				},
			},
			{ status: 500 }
		);
	}
}

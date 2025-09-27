import { NextRequest, NextResponse } from "next/server";
import { ScoringService } from "@/lib/scoring/ScoringService";
import type {
	ScoringCompareRequest,
	ScoringCompareResponse,
} from "@/types/api";
import type { ScoringConfig } from "@/types/scoring";

/** POST /api/scoring/compare - 개선안 A/B 점수 비교 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as ScoringCompareRequest;

		if (!body || typeof body !== "object") {
			return NextResponse.json(
				{
					success: false,
					error: { error: "잘못된 요청 형식입니다.", code: "INVALID_REQUEST" },
				},
				{ status: 400 }
			);
		}

		const { originalPrompt, improvedPromptA, improvedPromptB, scoringConfig } =
			body;

		if (!originalPrompt || !improvedPromptA || !improvedPromptB) {
			return NextResponse.json(
				{
					success: false,
					error: {
						error: "필수 필드가 누락되었습니다.",
						code: "INVALID_REQUEST",
					},
				},
				{ status: 400 }
			);
		}

		const service = new ScoringService();
		const configOverride: Partial<ScoringConfig> | undefined = scoringConfig;

		const [analysisA, analysisB] = await Promise.all([
			service.analyzeImprovement(
				originalPrompt,
				improvedPromptA,
				configOverride
			),
			service.analyzeImprovement(
				originalPrompt,
				improvedPromptB,
				configOverride
			),
		]);

		const scoreA = analysisA.improvementScore.overallScore;
		const scoreB = analysisB.improvementScore.overallScore;
		const diff = Math.round(Math.abs(scoreA - scoreB) * 100) / 100;

		const criteriaDiffs = analysisA.improvementScore.criteriaScores.map((a) => {
			const b = analysisB.improvementScore.criteriaScores.find(
				(c) => c.criterion === a.criterion
			);
			return {
				criterion: a.criterion,
				scoreA: a.score,
				scoreB: b ? b.score : 0,
				diff: Math.round((a.score - (b ? b.score : 0)) * 100) / 100,
			};
		});

		const better = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "equal";

		const data: ScoringCompareResponse = {
			analysisA,
			analysisB,
			better,
			scoreDiff: diff,
			criteriaDiffs,
		};

		return NextResponse.json({ success: true, data });
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

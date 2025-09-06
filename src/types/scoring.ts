/**
 * 프롬프트 개선 점수화 시스템 타입 정의
 */

/** 점수화 기준 열거형 */
export const ScoringCriteria = {
	CLARITY: "clarity", // 명확성
	SPECIFICITY: "specificity", // 구체성
	STRUCTURE: "structure", // 구조화
	COMPLETENESS: "completeness", // 완성도
	ACTIONABILITY: "actionability", // 실행가능성
} as const;

export type ScoringCriteriaType =
	(typeof ScoringCriteria)[keyof typeof ScoringCriteria];

/** 개별 기준 점수 (0-1 사이) */
export interface CriterionScore {
	/** 기준 타입 */
	criterion: ScoringCriteriaType;
	/** 점수 (0-1) */
	score: number;
	/** 점수 산출 근거 */
	reasoning: string;
	/** 개선 제안 */
	suggestions: string[];
	/** 신뢰도 (0-1) */
	confidence: number;
}

/** 전체 개선 점수 */
export interface ImprovementScore {
	/** 개별 기준별 점수들 */
	criteriaScores: CriterionScore[];
	/** 가중 평균 점수 (0-1) */
	overallScore: number;
	/** 개선 등급 */
	grade: "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";
	/** 전체 평가 요약 */
	summary: string;
	/** 주요 개선 포인트들 */
	keyImprovements: string[];
	/** 추가 개선 제안 */
	nextStepSuggestions: string[];
	/** 점수 산출 시간 */
	timestamp: string;
}

/** 프롬프트 비교 분석 결과 */
export interface PromptComparisonAnalysis {
	/** 원본 프롬프트 */
	originalPrompt: string;
	/** 개선된 프롬프트 */
	improvedPrompt: string;
	/** 개선 점수 */
	improvementScore: ImprovementScore;
	/** 길이 분석 */
	lengthAnalysis: {
		originalLength: number;
		improvedLength: number;
		lengthIncrease: number;
		lengthIncreaseRatio: number;
	};
	/** 복잡성 분석 */
	complexityAnalysis: {
		originalComplexity: number;
		improvedComplexity: number;
		complexityIncrease: number;
	};
}

/** 점수화 알고리즘 설정 */
export interface ScoringConfig {
	/** 기준별 가중치 */
	weights: Record<ScoringCriteriaType, number>;
	/** 최소 신뢰도 임계값 */
	minConfidenceThreshold: number;
	/** 우수 점수 임계값 */
	excellentThreshold: number;
	/** 양호 점수 임계값 */
	goodThreshold: number;
	/** 보통 점수 임계값 */
	moderateThreshold: number;
}

/** 기본 점수화 설정 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
	weights: {
		[ScoringCriteria.CLARITY]: 0.25, // 25%
		[ScoringCriteria.SPECIFICITY]: 0.25, // 25%
		[ScoringCriteria.STRUCTURE]: 0.2, // 20%
		[ScoringCriteria.COMPLETENESS]: 0.15, // 15%
		[ScoringCriteria.ACTIONABILITY]: 0.15, // 15%
	},
	minConfidenceThreshold: 0.7,
	excellentThreshold: 0.85,
	goodThreshold: 0.7,
	moderateThreshold: 0.5,
};

/** 점수화 에러 타입 */
export class ScoringError extends Error {
	constructor(
		message: string,
		public code:
			| "INVALID_PROMPT"
			| "ANALYSIS_FAILED"
			| "CONFIG_ERROR"
			| "API_ERROR",
		public details?: Record<string, unknown>
	) {
		super(message);
		this.name = "ScoringError";
	}
}

/** 히스토리용 점수 데이터 */
export interface ScoringHistoryEntry {
	/** 고유 ID */
	id: string;
	/** 프롬프트 세션 ID */
	sessionId: string;
	/** 분석 결과 */
	analysis: PromptComparisonAnalysis;
	/** 생성 시간 */
	createdAt: string;
	/** 사용자 피드백 (선택적) */
	userFeedback?: {
		isAccurate: boolean;
		comments: string;
		suggestedScore?: number;
	};
}

/** 점수화 서비스 인터페이스 */
export interface IScoringService {
	/** 프롬프트 개선도 점수화 */
	analyzeImprovement(
		originalPrompt: string,
		improvedPrompt: string,
		config?: Partial<ScoringConfig>
	): Promise<PromptComparisonAnalysis>;

	/** 점수 기록 저장 */
	saveScore(analysis: PromptComparisonAnalysis): Promise<string>;

	/** 점수 기록 조회 */
	getScoreHistory(limit?: number): Promise<ScoringHistoryEntry[]>;

	/** 사용자 피드백 제출 */
	submitFeedback(
		entryId: string,
		feedback: ScoringHistoryEntry["userFeedback"]
	): Promise<void>;
}

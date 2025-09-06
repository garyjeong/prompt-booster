/**
 * 프롬프트 개선 점수화 서비스
 * 프롬프트 개선도를 체계적으로 분석하고 점수화
 */

import {
	type IScoringService,
	type PromptComparisonAnalysis,
	type ImprovementScore,
	type CriterionScore,
	type ScoringConfig,
	type ScoringHistoryEntry,
	type ScoringCriteriaType,
	ScoringCriteria,
	ScoringError,
	DEFAULT_SCORING_CONFIG,
} from "@/types/scoring";
import { getCurrentTimestamp } from "@/lib/utils";

export class ScoringService implements IScoringService {
	private config: ScoringConfig;
	private historyStorage: ScoringHistoryEntry[] = [];

	constructor(config: ScoringConfig = DEFAULT_SCORING_CONFIG) {
		this.validateConfig(config);
		this.config = config;
	}

	/**
	 * 프롬프트 개선도를 분석하고 점수화
	 */
	async analyzeImprovement(
		originalPrompt: string,
		improvedPrompt: string,
		config?: Partial<ScoringConfig>
	): Promise<PromptComparisonAnalysis> {
		// 입력 유효성 검증
		this.validatePrompts(originalPrompt, improvedPrompt);

		// 설정 병합
		const activeConfig = config ? { ...this.config, ...config } : this.config;

		// 기준별 점수 계산
		const criteriaScores = await this.calculateCriteriaScores(
			originalPrompt,
			improvedPrompt
		);

		// 전체 점수 계산
		const overallScore = this.calculateOverallScore(
			criteriaScores,
			activeConfig
		);

		// 등급 결정
		const grade = this.calculateGrade(overallScore);

		// 개선 분석
		const improvementScore: ImprovementScore = {
			criteriaScores,
			overallScore,
			grade,
			summary: this.generateSummary(criteriaScores, overallScore, grade),
			keyImprovements: this.identifyKeyImprovements(criteriaScores),
			nextStepSuggestions: this.generateNextStepSuggestions(criteriaScores),
			timestamp: getCurrentTimestamp(),
		};

		// 길이 및 복잡성 분석
		const lengthAnalysis = this.analyzeLengths(originalPrompt, improvedPrompt);
		const complexityAnalysis = this.analyzeComplexity(
			originalPrompt,
			improvedPrompt
		);

		return {
			originalPrompt,
			improvedPrompt,
			improvementScore,
			lengthAnalysis,
			complexityAnalysis,
		};
	}

	/**
	 * 점수 기록 저장
	 */
	async saveScore(analysis: PromptComparisonAnalysis): Promise<string> {
		const entry: ScoringHistoryEntry = {
			id: this.generateId(),
			sessionId: this.generateSessionId(),
			analysis,
			createdAt: getCurrentTimestamp(),
		};

		this.historyStorage.push(entry);

		// 실제로는 LocalStorage나 DB에 저장
		if (typeof window !== "undefined") {
			try {
				const existingHistory = localStorage.getItem("scoring_history");
				const history = existingHistory ? JSON.parse(existingHistory) : [];
				history.push(entry);
				localStorage.setItem(
					"scoring_history",
					JSON.stringify(history.slice(-100))
				); // 최근 100개만 유지
			} catch (error) {
				console.warn("점수 히스토리 저장 실패:", error);
			}
		}

		return entry.id;
	}

	/**
	 * 점수 기록 조회
	 */
	async getScoreHistory(limit?: number): Promise<ScoringHistoryEntry[]> {
		if (typeof window !== "undefined") {
			try {
				const existingHistory = localStorage.getItem("scoring_history");
				if (existingHistory) {
					const history = JSON.parse(existingHistory);
					return limit ? history.slice(-limit) : history;
				}
			} catch (error) {
				console.warn("점수 히스토리 로드 실패:", error);
			}
		}

		return limit ? this.historyStorage.slice(-limit) : this.historyStorage;
	}

	/**
	 * 사용자 피드백 제출
	 */
	async submitFeedback(
		entryId: string,
		feedback: ScoringHistoryEntry["userFeedback"]
	): Promise<void> {
		// 메모리에서 찾아서 업데이트
		const entry = this.historyStorage.find((e) => e.id === entryId);
		if (entry) {
			entry.userFeedback = feedback;
		}

		// LocalStorage에서도 업데이트
		if (typeof window !== "undefined") {
			try {
				const existingHistory = localStorage.getItem("scoring_history");
				if (existingHistory) {
					const history = JSON.parse(existingHistory);
					const historyEntry = history.find(
						(e: ScoringHistoryEntry) => e.id === entryId
					);
					if (historyEntry) {
						historyEntry.userFeedback = feedback;
						localStorage.setItem("scoring_history", JSON.stringify(history));
					}
				}
			} catch (error) {
				console.warn("피드백 저장 실패:", error);
			}
		}
	}

	/**
	 * 점수를 기반으로 등급 계산
	 */
	public calculateGrade(score: number): ImprovementScore["grade"] {
		if (score >= this.config.excellentThreshold) return "EXCELLENT";
		if (score >= this.config.goodThreshold) return "GOOD";
		if (score >= this.config.moderateThreshold) return "MODERATE";
		return "POOR";
	}

	// ===== 내부 메소드들 =====

	private validateConfig(config: ScoringConfig): void {
		// 가중치 합이 1.0인지 확인
		const weightSum = Object.values(config.weights).reduce(
			(sum, weight) => sum + weight,
			0
		);
		if (Math.abs(weightSum - 1.0) > 0.01) {
			throw new ScoringError(
				`가중치의 합은 1.0이어야 합니다. 현재: ${weightSum}`,
				"CONFIG_ERROR"
			);
		}

		// 가중치가 0-1 범위인지 확인
		Object.entries(config.weights).forEach(([criterion, weight]) => {
			if (weight < 0 || weight > 1) {
				throw new ScoringError(
					`가중치는 0-1 범위여야 합니다. ${criterion}: ${weight}`,
					"CONFIG_ERROR"
				);
			}
		});
	}

	private validatePrompts(original: string, improved: string): void {
		if (!original || !original.trim()) {
			throw new ScoringError("원본 프롬프트가 비어있습니다.", "INVALID_PROMPT");
		}

		if (!improved || !improved.trim()) {
			throw new ScoringError(
				"개선된 프롬프트가 비어있습니다.",
				"INVALID_PROMPT"
			);
		}

		if (original.length > 10000 || improved.length > 10000) {
			throw new ScoringError(
				"프롬프트가 너무 깁니다. (최대 10,000자)",
				"INVALID_PROMPT"
			);
		}
	}

	private async calculateCriteriaScores(
		original: string,
		improved: string
	): Promise<CriterionScore[]> {
		const scores: CriterionScore[] = [];

		// 명확성 점수
		scores.push(await this.calculateClarityScore(original, improved));

		// 구체성 점수
		scores.push(await this.calculateSpecificityScore(original, improved));

		// 구조화 점수
		scores.push(await this.calculateStructureScore(original, improved));

		// 완성도 점수
		scores.push(await this.calculateCompletenessScore(original, improved));

		// 실행가능성 점수
		scores.push(await this.calculateActionabilityScore(original, improved));

		return scores;
	}

	private async calculateClarityScore(
		original: string,
		improved: string
	): Promise<CriterionScore> {
		// 명확성 분석 로직
		let score = 0.3; // 기본 점수를 낮춤
		const suggestions: string[] = [];

		// 동일한 내용인 경우 매우 낮은 점수
		if (original.trim() === improved.trim()) {
			score = 0.05;
			suggestions.push("프롬프트에 변화가 없습니다");
			return {
				criterion: ScoringCriteria.CLARITY,
				score,
				reasoning: "원본과 개선된 프롬프트가 동일함",
				suggestions,
				confidence: 0.95,
			};
		}

		// 모호한 표현 감소 여부 확인
		const ambiguousWords = [
			"좀",
			"적당히",
			"대충",
			"잘",
			"좋게",
			"많이",
			"조금",
			"해줘",
			"해주세요",
		];
		const originalAmbiguous = ambiguousWords.filter((word) =>
			original.toLowerCase().includes(word.toLowerCase())
		).length;
		const improvedAmbiguous = ambiguousWords.filter((word) =>
			improved.toLowerCase().includes(word.toLowerCase())
		).length;

		if (improvedAmbiguous < originalAmbiguous) {
			score += 0.3;
		} else if (improvedAmbiguous > originalAmbiguous) {
			suggestions.push("모호한 표현을 구체적인 표현으로 바꿔보세요");
			score -= 0.2;
		}

		// 구체적인 용어 추가 여부
		const specificTerms = [
			"구체적으로",
			"예를 들어",
			"단계별로",
			"다음과 같이",
			"요구사항",
			"조건",
		];
		const specificTermsAdded = specificTerms.filter(
			(term) =>
				!original.toLowerCase().includes(term.toLowerCase()) &&
				improved.toLowerCase().includes(term.toLowerCase())
		).length;

		score += specificTermsAdded * 0.15;

		// 상당한 길이 증가와 정보 추가 여부
		const lengthRatio = improved.length / Math.max(original.length, 1);
		if (lengthRatio > 3 && improved.includes("\n")) {
			// 3배 이상 증가하고 구조화됨
			score += 0.4;
		} else if (lengthRatio > 2) {
			score += 0.2;
		}

		return {
			criterion: ScoringCriteria.CLARITY,
			score: Math.max(0, Math.min(1, score)),
			reasoning: `명확성 분석: 모호한 표현 ${originalAmbiguous} → ${improvedAmbiguous}개, 구체적 용어 ${specificTermsAdded}개 추가`,
			suggestions,
			confidence: 0.8,
		};
	}

	private async calculateSpecificityScore(
		original: string,
		improved: string
	): Promise<CriterionScore> {
		let score = 0.3; // 기본 점수 낮춤
		const suggestions: string[] = [];

		// 동일한 내용인 경우 매우 낮은 점수
		if (original.trim() === improved.trim()) {
			return {
				criterion: ScoringCriteria.SPECIFICITY,
				score: 0.05,
				reasoning: "원본과 개선된 프롬프트가 동일함",
				suggestions: ["프롬프트에 구체적인 정보를 추가해보세요"],
				confidence: 0.95,
			};
		}

		// 기술 스택, 프레임워크 명시 여부
		const techTerms = [
			"react",
			"typescript",
			"python",
			"javascript",
			"java",
			"css",
			"html",
			"node",
			"angular",
			"vue",
		];
		const originalTech = techTerms.filter((term) =>
			original.toLowerCase().includes(term.toLowerCase())
		).length;
		const improvedTech = techTerms.filter((term) =>
			improved.toLowerCase().includes(term.toLowerCase())
		).length;

		if (improvedTech > originalTech) {
			score += Math.min(0.4, improvedTech * 0.1); // 기술 용어당 0.1점, 최대 0.4점
		}

		// 숫자나 구체적인 조건 추가
		const numberPattern = /\d+/g;
		const originalNumbers = (original.match(numberPattern) || []).length;
		const improvedNumbers = (improved.match(numberPattern) || []).length;

		if (improvedNumbers > originalNumbers) {
			score += Math.min(0.3, (improvedNumbers - originalNumbers) * 0.1);
		}

		// 요구사항 리스트 형태로 구성
		const listPattern = /\n\s*[-•*]\s+|\n\s*\d+\.\s+/g;
		const improvedLists = (improved.match(listPattern) || []).length;
		const originalLists = (original.match(listPattern) || []).length;

		if (improvedLists > originalLists) {
			score += Math.min(0.3, (improvedLists - originalLists) * 0.05); // 리스트 항목당 0.05점
		}

		// 구체적인 명시사항 추가 (파일 형식, 버전, 조건 등)
		const specificElements = [
			"버전",
			"형식",
			"파일",
			"함수",
			"클래스",
			"컴포넌트",
			"모듈",
		];
		const specificElementsAdded = specificElements.filter(
			(element) =>
				!original.toLowerCase().includes(element) &&
				improved.toLowerCase().includes(element)
		).length;

		score += specificElementsAdded * 0.1;

		if (score <= 0.6) {
			suggestions.push("구체적인 기술 스택이나 요구사항을 명시해보세요");
		}

		return {
			criterion: ScoringCriteria.SPECIFICITY,
			score: Math.max(0, Math.min(1, score)),
			reasoning: `구체성 분석: 기술 용어 ${originalTech} → ${improvedTech}개, 숫자 ${originalNumbers} → ${improvedNumbers}개, 리스트 항목 ${originalLists} → ${improvedLists}개`,
			suggestions,
			confidence: 0.85,
		};
	}

	private async calculateStructureScore(
		original: string,
		improved: string
	): Promise<CriterionScore> {
		let score = 0.3; // 기본 점수 낮춤
		const suggestions: string[] = [];

		// 동일한 내용인 경우 매우 낮은 점수
		if (original.trim() === improved.trim()) {
			return {
				criterion: ScoringCriteria.STRUCTURE,
				score: 0.05,
				reasoning: "원본과 개선된 프롬프트가 동일함",
				suggestions: ["프롬프트를 구조화해보세요"],
				confidence: 0.95,
			};
		}

		// 섹션 구분 여부 (제목, 구분선 등)
		const sectionPattern =
			/\n\s*#+\s+|\n\s*==+\s*\n|\n\s*--+\s*\n|\n\s*\*\*[^*]+\*\*\s*:|\n\s*[가-힣\w\s]+:/g;
		const improvedSections = (improved.match(sectionPattern) || []).length;
		const originalSections = (original.match(sectionPattern) || []).length;

		if (improvedSections > originalSections) {
			score += Math.min(0.4, (improvedSections - originalSections) * 0.1);
		}

		// 단락 구분 개선 (적당한 수의 단락이 좋음)
		const improvedParagraphs = improved
			.split("\n\n")
			.filter((p) => p.trim()).length;
		const originalParagraphs = original
			.split("\n\n")
			.filter((p) => p.trim()).length;

		if (improvedParagraphs > originalParagraphs) {
			if (improvedParagraphs >= 3 && improvedParagraphs <= 8) {
				// 적절한 단락 수
				score += 0.25;
			} else if (improvedParagraphs > 1) {
				score += 0.1;
			}
		}

		// 순서나 구조가 있는 형태
		const structureKeywords = [
			"요구사항",
			"조건",
			"단계",
			"순서",
			"절차",
			"결과",
			"입력",
			"출력",
		];
		const structureKeywordsAdded = structureKeywords.filter(
			(keyword) =>
				!original.toLowerCase().includes(keyword.toLowerCase()) &&
				improved.toLowerCase().includes(keyword.toLowerCase())
		).length;

		score += structureKeywordsAdded * 0.1;

		// 계층적 구조 (중첩된 리스트나 들여쓰기)
		const hierarchicalPattern = /\n\s{2,}[-•*]\s+|\n\s+\w\.\s+/g;
		const hasHierarchy =
			hierarchicalPattern.test(improved) && !hierarchicalPattern.test(original);
		if (hasHierarchy) {
			score += 0.2;
		}

		if (score <= 0.6) {
			suggestions.push("내용을 섹션별로 구조화하고 단계를 명시해보세요");
		}

		return {
			criterion: ScoringCriteria.STRUCTURE,
			score: Math.max(0, Math.min(1, score)),
			reasoning: `구조화 분석: 섹션 ${originalSections} → ${improvedSections}개, 단락 ${originalParagraphs} → ${improvedParagraphs}개, 구조 키워드 ${structureKeywordsAdded}개 추가`,
			suggestions,
			confidence: 0.75,
		};
	}

	private async calculateCompletenessScore(
		original: string,
		improved: string
	): Promise<CriterionScore> {
		let score = 0.3; // 기본 점수 낮춤
		const suggestions: string[] = [];

		// 동일한 내용인 경우 매우 낮은 점수
		if (original.trim() === improved.trim()) {
			return {
				criterion: ScoringCriteria.COMPLETENESS,
				score: 0.05,
				reasoning: "원본과 개선된 프롬프트가 동일함",
				suggestions: ["누락된 정보를 추가해보세요"],
				confidence: 0.95,
			};
		}

		// 중요한 정보 추가 여부
		const importantAspects = [
			"입력",
			"출력",
			"조건",
			"제약",
			"예시",
			"형식",
			"결과",
		];
		const originalAspects = importantAspects.filter((aspect) =>
			original.toLowerCase().includes(aspect)
		).length;
		const improvedAspects = importantAspects.filter((aspect) =>
			improved.toLowerCase().includes(aspect)
		).length;

		if (improvedAspects > originalAspects) {
			score += 0.4;
		}

		// 예시나 샘플 제공 여부
		const exampleKeywords = ["예시", "예제", "샘플", "예상", "다음과 같이"];
		const hasExamples = exampleKeywords.some(
			(keyword) => improved.includes(keyword) && !original.includes(keyword)
		);

		if (hasExamples) {
			score += 0.2;
		}

		if (score <= 0.6) {
			suggestions.push("입력/출력 형식이나 예시를 추가해보세요");
		}

		return {
			criterion: ScoringCriteria.COMPLETENESS,
			score: Math.max(0, Math.min(1, score)),
			reasoning: `완성도 분석: 중요 정보 ${originalAspects} → ${improvedAspects}개`,
			suggestions,
			confidence: 0.8,
		};
	}

	private async calculateActionabilityScore(
		original: string,
		improved: string
	): Promise<CriterionScore> {
		let score = 0.3; // 기본 점수 낮춤
		const suggestions: string[] = [];

		// 동일한 내용인 경우 매우 낮은 점수
		if (original.trim() === improved.trim()) {
			return {
				criterion: ScoringCriteria.ACTIONABILITY,
				score: 0.05,
				reasoning: "원본과 개선된 프롬프트가 동일함",
				suggestions: ["구체적인 실행 단계를 추가해보세요"],
				confidence: 0.95,
			};
		}

		// 동작 동사 사용 여부
		const actionVerbs = [
			"작성",
			"구현",
			"생성",
			"만들",
			"개발",
			"설계",
			"분석",
			"처리",
		];
		const improvedActions = actionVerbs.filter((verb) =>
			improved.includes(verb)
		).length;
		const originalActions = actionVerbs.filter((verb) =>
			original.includes(verb)
		).length;

		if (improvedActions > originalActions) {
			score += 0.3;
		}

		// 구체적인 작업 단계 제시
		const stepPattern = /\n\s*\d+\.\s+/g;
		const hasSteps = stepPattern.test(improved) && !stepPattern.test(original);

		if (hasSteps) {
			score += 0.3;
		}

		if (score <= 0.6) {
			suggestions.push("구체적인 실행 단계를 명시해보세요");
		}

		return {
			criterion: ScoringCriteria.ACTIONABILITY,
			score: Math.max(0, Math.min(1, score)),
			reasoning: `실행가능성 분석: 실행 동사 ${originalActions} → ${improvedActions}개`,
			suggestions,
			confidence: 0.8,
		};
	}

	private calculateOverallScore(
		scores: CriterionScore[],
		config: ScoringConfig
	): number {
		const weightedSum = scores.reduce((sum, score) => {
			const weight = config.weights[score.criterion];
			return sum + score.score * weight;
		}, 0);

		return Math.round(weightedSum * 100) / 100; // 소수점 2자리까지
	}

	private generateSummary(
		scores: CriterionScore[],
		overallScore: number,
		grade: string
	): string {
		const strongPoints = scores
			.filter((s) => s.score >= 0.7)
			.map((s) => this.getCriterionName(s.criterion));
		const weakPoints = scores
			.filter((s) => s.score < 0.5)
			.map((s) => this.getCriterionName(s.criterion));

		let summary = `전체 점수 ${(overallScore * 100).toFixed(0)}점 (${grade})`;

		if (strongPoints.length > 0) {
			summary += `. 우수한 부분: ${strongPoints.join(", ")}`;
		}

		if (weakPoints.length > 0) {
			summary += `. 개선 필요: ${weakPoints.join(", ")}`;
		}

		return summary;
	}

	private identifyKeyImprovements(scores: CriterionScore[]): string[] {
		return scores
			.filter((score) => score.score >= 0.7)
			.map((score) => `${this.getCriterionName(score.criterion)} 향상`);
	}

	private generateNextStepSuggestions(scores: CriterionScore[]): string[] {
		const allSuggestions = scores
			.filter((score) => score.suggestions.length > 0)
			.flatMap((score) => score.suggestions);

		return [...new Set(allSuggestions)]; // 중복 제거
	}

	private getCriterionName(criterion: ScoringCriteriaType): string {
		const names = {
			[ScoringCriteria.CLARITY]: "명확성",
			[ScoringCriteria.SPECIFICITY]: "구체성",
			[ScoringCriteria.STRUCTURE]: "구조화",
			[ScoringCriteria.COMPLETENESS]: "완성도",
			[ScoringCriteria.ACTIONABILITY]: "실행가능성",
		};
		return names[criterion] || criterion;
	}

	private analyzeLengths(original: string, improved: string) {
		const originalLength = original.length;
		const improvedLength = improved.length;
		const lengthIncrease = improvedLength - originalLength;
		const lengthIncreaseRatio =
			originalLength > 0 ? improvedLength / originalLength : 1;

		return {
			originalLength,
			improvedLength,
			lengthIncrease,
			lengthIncreaseRatio,
		};
	}

	private analyzeComplexity(original: string, improved: string) {
		// 복잡성을 문장 수, 단어 수, 구두점 수 등으로 측정
		const calculateComplexity = (text: string): number => {
			const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
			const words = text.split(/\s+/).filter((w) => w.trim()).length;
			const punctuation = (text.match(/[,;:()[\]{}]/g) || []).length;
			const lists = (text.match(/\n\s*[-•*]\s+|\n\s*\d+\.\s+/g) || []).length;

			return sentences * 1 + words * 0.1 + punctuation * 0.5 + lists * 2;
		};

		const originalComplexity = calculateComplexity(original);
		const improvedComplexity = calculateComplexity(improved);
		const complexityIncrease = improvedComplexity - originalComplexity;

		return {
			originalComplexity,
			improvedComplexity,
			complexityIncrease,
		};
	}

	private generateId(): string {
		return `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateSessionId(): string {
		return `session_${Date.now()}`;
	}
}

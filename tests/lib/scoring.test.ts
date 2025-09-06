/**
 * 프롬프트 개선 점수화 시스템 테스트
 * TDD 기반으로 작성된 테스트 케이스들
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ScoringService } from '@/lib/scoring/ScoringService';
import { 
  ScoringCriteria, 
  DEFAULT_SCORING_CONFIG,
  type PromptComparisonAnalysis,
  type ScoringConfig,
  ScoringError
} from '@/types/scoring';

describe('ScoringService', () => {
  let scoringService: ScoringService;

  beforeEach(() => {
    scoringService = new ScoringService(DEFAULT_SCORING_CONFIG);
  });

  describe('analyzeImprovement', () => {
    it('간단한 프롬프트가 구체적으로 개선된 경우 높은 점수를 반환해야 함', async () => {
      // Arrange
      const originalPrompt = '코드를 작성해줘';
      const improvedPrompt = `React에서 useState를 사용하여 카운터 컴포넌트를 작성해주세요.

요구사항:
1. 초기값은 0
2. 증가/감소 버튼 포함  
3. TypeScript 사용
4. 함수형 컴포넌트로 구현

예상 출력:
- 현재 카운트 표시
- '+' 버튼으로 1씩 증가
- '-' 버튼으로 1씩 감소`;

      // Act
      const analysis = await scoringService.analyzeImprovement(originalPrompt, improvedPrompt);

      // Assert
      expect(analysis.originalPrompt).toBe(originalPrompt);
      expect(analysis.improvedPrompt).toBe(improvedPrompt);
      expect(analysis.improvementScore.overallScore).toBeGreaterThan(0.8);
      expect(analysis.improvementScore.grade).toBe('EXCELLENT');
      
      // 기준별 점수 검증
      const clarityScore = analysis.improvementScore.criteriaScores.find(
        c => c.criterion === ScoringCriteria.CLARITY
      );
      expect(clarityScore?.score).toBeGreaterThan(0.8);
      
      const specificityScore = analysis.improvementScore.criteriaScores.find(
        c => c.criterion === ScoringCriteria.SPECIFICITY
      );
      expect(specificityScore?.score).toBeGreaterThan(0.8);
    });

    it('비슷한 수준의 프롬프트인 경우 보통 점수를 반환해야 함', async () => {
      // Arrange  
      const originalPrompt = 'JavaScript 함수를 만들어주세요';
      const improvedPrompt = 'JavaScript로 함수를 작성해주세요';

      // Act
      const analysis = await scoringService.analyzeImprovement(originalPrompt, improvedPrompt);

      // Assert
      expect(analysis.improvementScore.overallScore).toBeLessThan(0.6);
      expect(analysis.improvementScore.grade).toBeOneOf(['MODERATE', 'POOR']);
    });

    it('빈 프롬프트인 경우 에러를 발생시켜야 함', async () => {
      // Arrange & Act & Assert
      await expect(scoringService.analyzeImprovement('', 'test prompt'))
        .rejects
        .toThrow(ScoringError);
    });

    it('동일한 프롬프트인 경우 낮은 점수를 반환해야 함', async () => {
      // Arrange
      const prompt = '같은 프롬프트입니다';

      // Act  
      const analysis = await scoringService.analyzeImprovement(prompt, prompt);

      // Assert
      expect(analysis.improvementScore.overallScore).toBeLessThan(0.3);
      expect(analysis.improvementScore.grade).toBe('POOR');
    });

    it('커스텀 설정으로 점수화가 가능해야 함', async () => {
      // Arrange
      const customConfig: Partial<ScoringConfig> = {
        weights: {
          [ScoringCriteria.CLARITY]: 0.5,
          [ScoringCriteria.SPECIFICITY]: 0.3,
          [ScoringCriteria.STRUCTURE]: 0.1,
          [ScoringCriteria.COMPLETENESS]: 0.05,
          [ScoringCriteria.ACTIONABILITY]: 0.05,
        }
      };

      const originalPrompt = '도움이 필요해';
      const improvedPrompt = `Python 데이터 분석 작업을 도와주세요.

구체적 요청사항:
1. CSV 파일 읽기
2. 결측값 처리 방법
3. 기본 통계 분석
4. 시각화 차트 생성

사용할 라이브러리: pandas, matplotlib, seaborn`;

      // Act
      const analysis = await scoringService.analyzeImprovement(
        originalPrompt, 
        improvedPrompt, 
        customConfig
      );

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.improvementScore.criteriaScores).toHaveLength(5);
    });
  });

  describe('길이 및 복잡성 분석', () => {
    it('프롬프트 길이 분석을 정확히 수행해야 함', async () => {
      // Arrange
      const originalPrompt = '짧은 프롬프트';
      const improvedPrompt = '이것은 훨씬 더 길고 자세한 프롬프트입니다. 많은 정보를 포함하고 있습니다.';

      // Act
      const analysis = await scoringService.analyzeImprovement(originalPrompt, improvedPrompt);

      // Assert
      expect(analysis.lengthAnalysis.originalLength).toBe(originalPrompt.length);
      expect(analysis.lengthAnalysis.improvedLength).toBe(improvedPrompt.length);
      expect(analysis.lengthAnalysis.lengthIncrease).toBeGreaterThan(0);
      expect(analysis.lengthAnalysis.lengthIncreaseRatio).toBeGreaterThan(1);
    });

    it('복잡성 증가를 감지해야 함', async () => {
      // Arrange
      const originalPrompt = '간단';
      const improvedPrompt = `상세한 요구사항:
1. 첫 번째 단계
2. 두 번째 단계 
   - 하위 항목 a
   - 하위 항목 b
3. 세 번째 단계

조건:
- 조건 1
- 조건 2

예상 결과:
결과물에 대한 설명`;

      // Act
      const analysis = await scoringService.analyzeImprovement(originalPrompt, improvedPrompt);

      // Assert
      expect(analysis.complexityAnalysis.complexityIncrease).toBeGreaterThan(0);
      expect(analysis.complexityAnalysis.improvedComplexity)
        .toBeGreaterThan(analysis.complexityAnalysis.originalComplexity);
    });
  });

  describe('점수 히스토리 관리', () => {
    it('점수를 저장하고 조회할 수 있어야 함', async () => {
      // Arrange
      const originalPrompt = '테스트 프롬프트';
      const improvedPrompt = '개선된 테스트 프롬프트입니다';
      
      const analysis = await scoringService.analyzeImprovement(originalPrompt, improvedPrompt);

      // Act
      const entryId = await scoringService.saveScore(analysis);
      const history = await scoringService.getScoreHistory(1);

      // Assert
      expect(entryId).toBeTruthy();
      expect(history).toHaveLength(1);
      expect(history[0].analysis.originalPrompt).toBe(originalPrompt);
      expect(history[0].analysis.improvedPrompt).toBe(improvedPrompt);
    });

    it('사용자 피드백을 제출할 수 있어야 함', async () => {
      // Arrange
      const analysis = await scoringService.analyzeImprovement('원본', '개선된 버전');
      const entryId = await scoringService.saveScore(analysis);
      
      const feedback = {
        isAccurate: true,
        comments: '정확한 점수입니다',
        suggestedScore: 0.85
      };

      // Act
      await scoringService.submitFeedback(entryId, feedback);
      const history = await scoringService.getScoreHistory(1);

      // Assert
      expect(history[0].userFeedback).toEqual(feedback);
    });
  });

  describe('에러 처리', () => {
    it('잘못된 설정으로 인한 에러를 처리해야 함', () => {
      // Arrange
      const invalidConfig = {
        weights: {
          [ScoringCriteria.CLARITY]: 1.5, // 잘못된 가중치 (> 1.0)
        }
      } as any;

      // Act & Assert
      expect(() => new ScoringService(invalidConfig)).toThrow(ScoringError);
    });

    it('너무 긴 프롬프트에 대한 에러를 처리해야 함', async () => {
      // Arrange
      const tooLongPrompt = 'x'.repeat(10001); // 10KB 초과
      const normalPrompt = '정상 프롬프트';

      // Act & Assert
      await expect(scoringService.analyzeImprovement(tooLongPrompt, normalPrompt))
        .rejects
        .toThrow(ScoringError);
    });
  });

  describe('점수 등급 분류', () => {
    it.each([
      [0.9, 'EXCELLENT'],
      [0.8, 'GOOD'], 
      [0.6, 'MODERATE'],
      [0.3, 'POOR'],
    ])('점수 %d는 등급 %s를 반환해야 함', (score, expectedGrade) => {
      // Act
      const grade = scoringService.calculateGrade(score);

      // Assert
      expect(grade).toBe(expectedGrade);
    });
  });
});

// 테스트 유틸리티 함수들
expect.extend({
  toBeOneOf(received: any, expected: any[]) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected.join(', ')}`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}

/**
 * 대상 모델 라우팅 및 템플릿 적용 테스트
 */

import { buildSystemPromptForTarget, validateRequest } from '@/lib/prompt-api';
import type { TargetModel, PromptImprovementRequest } from '@/types/api';

describe('Target Model System', () => {
  describe('buildSystemPromptForTarget', () => {
    it('should generate different prompts for different target models', () => {
      const gptPrompt = buildSystemPromptForTarget('gpt-5');
      const geminiPrompt = buildSystemPromptForTarget('gemini-2.5-pro');
      const claudeSonnetPrompt = buildSystemPromptForTarget('claude-4-sonnet');
      const claudeOpusPrompt = buildSystemPromptForTarget('claude-4-opus');

      // 각 프롬프트는 달라야 함
      expect(gptPrompt).not.toBe(geminiPrompt);
      expect(gptPrompt).not.toBe(claudeSonnetPrompt);
      expect(gptPrompt).not.toBe(claudeOpusPrompt);

      // 모든 프롬프트는 기본 베이스를 포함해야 함
      expect(gptPrompt).toContain('You are an expert prompt engineer');
      expect(geminiPrompt).toContain('You are an expert prompt engineer');
      expect(claudeSonnetPrompt).toContain('You are an expert prompt engineer');
      expect(claudeOpusPrompt).toContain('You are an expert prompt engineer');

      // 각 모델별 특화 가이드를 포함해야 함
      expect(gptPrompt).toContain('GPT-5');
      expect(geminiPrompt).toContain('Gemini 2.5 Pro');
      expect(claudeSonnetPrompt).toContain('Claude 4 Sonnet');
      expect(claudeOpusPrompt).toContain('Claude 4 Opus');
    });

    it('should handle unknown target models gracefully', () => {
      const unknownPrompt = buildSystemPromptForTarget('unknown-model' as TargetModel);
      
      // 기본 모델(gpt-5)로 폴백해야 함
      expect(unknownPrompt).toContain('GPT-5');
      expect(unknownPrompt).toContain('You are an expert prompt engineer');
    });
  });

  describe('validateRequest with targetModel', () => {
    it('should accept valid targetModel values', () => {
      const validModels: TargetModel[] = ['gpt-5', 'gemini-2.5-pro', 'claude-4-sonnet', 'claude-4-opus'];
      
      validModels.forEach(model => {
        const request: PromptImprovementRequest = {
          prompt: 'Test prompt',
          targetModel: model
        };
        
        const result = validateRequest(request);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid targetModel values', () => {
      const request = {
        prompt: 'Test prompt',
        targetModel: 'invalid-model'
      };
      
      const result = validateRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('지원하지 않는 targetModel');
    });

    it('should accept requests without targetModel (backward compatibility)', () => {
      const request: PromptImprovementRequest = {
        prompt: 'Test prompt'
      };
      
      const result = validateRequest(request);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-string targetModel values', () => {
      const request = {
        prompt: 'Test prompt',
        targetModel: 123
      };
      
      const result = validateRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('지원하지 않는 targetModel');
    });
  });

  describe('Model Profile Coverage', () => {
    it('should have profiles for all supported models', () => {
      const supportedModels: TargetModel[] = ['gpt-5', 'gemini-2.5-pro', 'claude-4-sonnet', 'claude-4-opus'];
      
      supportedModels.forEach(model => {
        const prompt = buildSystemPromptForTarget(model);
        expect(prompt).toBeTruthy();
        expect(prompt.length).toBeGreaterThan(100); // 충분한 길이의 가이드가 있어야 함
      });
    });
  });
});

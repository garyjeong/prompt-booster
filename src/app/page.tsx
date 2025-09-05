'use client';

import { VStack, HStack } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import PromptInput from '@/components/PromptInput';
import PromptResult from '@/components/PromptResult';
import ApiKeyInput from '@/components/ApiKeyInput';
import { ApiKeyProvider, useApiKeys } from '@/context/ApiKeyContext';
import { PromptProvider, useCurrentPrompt, usePromptHistory } from '@/context/PromptContext';
import { withCache, generateCacheKey } from '@/lib/api-cache';
import type { PromptImprovementRequest, APIResponse, PromptImprovementResponse } from '@/types/api';

/** 실제 API를 호출하는 프롬프트 개선 함수 (캐싱 적용) */
async function improvePrompt(request: PromptImprovementRequest): Promise<string> {
  // 캐시 키 생성
  const cacheKey = generateCacheKey(request.prompt, request.provider || 'unknown');
  
  // 캐시된 응답이 있으면 즉시 반환
  return withCache(
    cacheKey,
    async () => {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: APIResponse<PromptImprovementResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.error);
      }

      return result.data.improvedPrompt;
    }
  );
}

/** 메인 앱 컴포넌트 */
function PromptBoosterApp() {
  const { apiKeys } = useApiKeys();
  const { 
    current, 
    setOriginalPrompt, 
    setImprovedPrompt, 
    setLoading, 
    setError, 
    clearError 
  } = useCurrentPrompt();
  const { addToHistory } = usePromptHistory();

  const handlePromptSubmit = async (prompt: string) => {
    // 상태 초기화 및 설정
    setOriginalPrompt(prompt);
    setImprovedPrompt('');
    clearError();
    setLoading(true);

    		try {
			// API 요청 생성 (환경변수 API Key를 사용하거나, 사용자 API Key를 fallback으로 사용)
			const request: PromptImprovementRequest = {
				prompt,
				openaiKey: apiKeys.openai,
				geminiKey: apiKeys.gemini,
				// 사용자가 선호하는 프로바이더가 있으면 사용, 없으면 서버에서 결정
				provider: apiKeys.openai ? 'openai' : apiKeys.gemini ? 'gemini' : undefined
			};

      const startTime = Date.now();
      const result = await improvePrompt(request);
      const processingTime = Date.now() - startTime;

      // 개선된 프롬프트 설정
      setImprovedPrompt(result);

      // 히스토리에 세션 추가
      addToHistory({
        originalPrompt: prompt,
        improvedPrompt: result,
        provider: request.provider!,
        processingTime,
      });
      
    } catch (error) {
      console.error('프롬프트 개선 실패:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '프롬프트 개선 중 알 수 없는 오류가 발생했습니다.';
      
      setError(errorMessage);
      setImprovedPrompt(''); // 에러 시 개선된 프롬프트 초기화
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <VStack spacing={8} align="stretch" maxW="4xl" mx="auto">
        {/* API 키 설정 버튼 */}
        <HStack justify="flex-end" w="full">
          <ApiKeyInput />
        </HStack>

        <PromptInput 
          onSubmit={handlePromptSubmit}
          isLoading={current.isLoading}
        />
        
        <PromptResult
          originalPrompt={current.originalPrompt}
          improvedPrompt={current.improvedPrompt}
          isLoading={current.isLoading}
          error={current.error}
        />
      </VStack>
    </Layout>
  );
}

export default function Home() {
  return (
    <ApiKeyProvider>
      <PromptProvider>
        <PromptBoosterApp />
      </PromptProvider>
    </ApiKeyProvider>
  );
}

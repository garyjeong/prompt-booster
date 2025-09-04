'use client';

import { VStack, HStack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import PromptInput from '@/components/PromptInput';
import PromptResult from '@/components/PromptResult';
import ApiKeyInput from '@/components/ApiKeyInput';
import { ApiKeyProvider, useApiKeys } from '@/context/ApiKeyContext';
import { PromptProvider, useCurrentPrompt, usePromptHistory } from '@/context/PromptContext';
import { AdsProvider } from '@/context/AdsContext';
import { withCache, generateCacheKey } from '@/lib/api-cache';
import type { PromptImprovementRequest, APIResponse, PromptImprovementResponse } from '@/types/api';

// Dynamic imports for code splitting
const AdSettings = dynamic(() => import('@/components/ads/AdSettings'), {
  ssr: false, // 클라이언트에서만 로드
  loading: () => null, // 로딩 상태 없음 (개발 모드에서만 사용)
});

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
  const { apiKeys, hasKeys } = useApiKeys();
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
      // API 키가 없으면 에러 처리
      if (!hasKeys) {
        throw new Error('API 키를 설정해주세요. 오른쪽 상단의 "API 키 설정" 버튼을 클릭하세요.');
      }

      // API 요청 생성
      const request: PromptImprovementRequest = {
        prompt,
        openaiKey: apiKeys.openai,
        geminiKey: apiKeys.gemini,
        // OpenAI가 있으면 우선 사용, 없으면 Gemini 사용
        provider: apiKeys.openai ? 'openai' : 'gemini'
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
        {/* 설정 버튼들 */}
        <HStack justify="space-between" w="full">
          {/* 광고 설정 (개발 모드에서만) */}
          {process.env.NODE_ENV === 'development' && (
            <AdSettings devOnly={true} />
          )}
          
          {/* API 키 설정 버튼 */}
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
        <AdsProvider>
          <PromptBoosterApp />
        </AdsProvider>
      </PromptProvider>
    </ApiKeyProvider>
  );
}

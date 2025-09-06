'use client';

import { useState } from 'react';
import { VStack, HStack, Button, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import PromptInput from '@/components/PromptInput';
import PromptResult from '@/components/PromptResult';
import ColorModeToggle from '@/components/ColorModeToggle';

// ApiKeyInput 지연 로딩 (설정 버튼 클릭 시에만 로드)
const ApiKeyInput = dynamic(() => import('@/components/ApiKeyInput'), {
  loading: () => (
    <Box p={4} textAlign="center">
      <Text fontSize="sm" color="gray.500">API 키 설정을 불러오는 중...</Text>
    </Box>
  ),
  ssr: false
});
import { ApiKeyProvider, useApiKeys } from '@/context/ApiKeyContext';
import { PromptProvider, useCurrentPrompt, usePromptHistory } from '@/context/PromptContext';
import { withCache, generateCacheKey } from '@/lib/api-cache';
import type { PromptImprovementRequest, APIResponse, PromptImprovementResponse } from '@/types/api';
import type { PromptComparisonAnalysis } from '@/types/scoring';

/** 실제 API를 호출하는 프롬프트 개선 함수 (캐싱 적용) */
async function improvePrompt(request: PromptImprovementRequest): Promise<PromptImprovementResponse> {
  // 캐시 키 생성
  const cacheKey = generateCacheKey(request.prompt, 'gemini');
  
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

      return result.data;
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

  // 점수화 데이터 상태 관리
  const [scoringAnalysis, setScoringAnalysis] = useState<PromptComparisonAnalysis | undefined>(undefined);
  const [provider, setProvider] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const handlePromptSubmit = async (prompt: string) => {
    // 상태 초기화 및 설정
    setOriginalPrompt(prompt);
    setImprovedPrompt('');
    clearError();
    setLoading(true);
    
    // 점수화 데이터 초기화
    setScoringAnalysis(undefined);
    setProvider('');
    setProcessingTime(0);
    setIsDemoMode(false);

    		try {
			// API 요청 생성 (환경변수 API Key를 사용하거나, 사용자 API Key를 fallback으로 사용)
			const request: PromptImprovementRequest = {
				prompt,
				geminiKey: apiKeys.gemini,
			};

      const result = await improvePrompt(request);

      // 개선된 프롬프트 설정
      setImprovedPrompt(result.improvedPrompt);

      // 점수화 데이터 설정
      if (result.scoringAnalysis) {
        setScoringAnalysis(result.scoringAnalysis);
      }
      setProvider(result.provider);
      setProcessingTime(result.processingTime);
      setIsDemoMode(result.isDemoMode || false);

      // 히스토리에 세션 추가
      addToHistory({
        originalPrompt: prompt,
        improvedPrompt: result.improvedPrompt,
        provider: result.provider,
        processingTime: result.processingTime,
        isDemoMode: result.isDemoMode,
        scoringAnalysis: result.scoringAnalysis,
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
      <VStack spacing={0} align="stretch" w="full">
        {/* 상단 컨트롤 바 - 미니멀한 디자인 */}
        <HStack 
          justify="space-between" 
          w="full" 
          mb={8}
          px={4}
          py={3}
          bg={useColorModeValue('gray.50', 'gray.800')}
          borderRadius="2xl"
          shadow="sm"
        >
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>
              도구
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/history', '_blank')}
              leftIcon={<TimeIcon />}
              borderRadius="xl"
            >
              히스토리
            </Button>
            <ColorModeToggle size="sm" variant="ghost" />
            <ApiKeyInput />
          </HStack>
        </HStack>

        {/* 대화형 메인 영역 */}
        <VStack spacing={6} align="stretch" flex="1">
          {/* 프롬프트 결과 - 대화처럼 표시 */}
          <PromptResult
            originalPrompt={current.originalPrompt}
            improvedPrompt={current.improvedPrompt}
            isLoading={current.isLoading}
            error={current.error}
            scoringAnalysis={scoringAnalysis}
            provider={provider}
            processingTime={processingTime}
            isDemoMode={isDemoMode}
          />
          
          {/* 하단 고정 입력 영역 */}
          <Box 
            position="sticky" 
            bottom={0} 
            bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(24, 24, 27, 0.9)')}
            backdropFilter="blur(10px)"
            pt={4}
            mt="auto"
          >
            <PromptInput 
              onSubmit={handlePromptSubmit}
              isLoading={current.isLoading}
            />
          </Box>
        </VStack>
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

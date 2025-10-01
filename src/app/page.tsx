'use client';

import ColorModeToggle from '@/components/ColorModeToggle';
import Layout from '@/components/Layout';
import ModelInfo from '@/components/ModelInfo';
import PromptInput from '@/components/PromptInput';
import PromptResult from '@/components/PromptResult';
import { Box, Flex, HStack, Select, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { ApiKeyProvider } from '@/context/ApiKeyContext';
import { PromptProvider, useCurrentPrompt } from '@/context/PromptContext';
import { generateCacheKey, withCache } from '@/lib/api-cache';
import type { APIResponse, PromptImprovementRequest, PromptImprovementResponse, TargetModel } from '@/types/api';
import type { PromptComparisonAnalysis } from '@/types/scoring';

/** 실제 API를 호출하는 프롬프트 개선 함수 (캐싱 적용) */
async function improvePrompt(request: PromptImprovementRequest): Promise<PromptImprovementResponse> {
  // 캐시 키 생성
  const cacheKey = generateCacheKey(request.prompt, `gemini:${request.targetModel || 'gpt-5'}`);
  
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
  const { 
    current, 
    setOriginalPrompt, 
    setImprovedPrompt, 
    setLoading, 
    setError, 
    clearError 
  } = useCurrentPrompt();

  // 점수화 데이터 상태 관리
  const [scoringAnalysis, setScoringAnalysis] = useState<PromptComparisonAnalysis | undefined>(undefined);
  const [provider, setProvider] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  
  // 대상 모델 선택 상태 관리
  const [selectedTargetModel, setSelectedTargetModel] = useState<TargetModel>('gpt-5');

  const hasResult = Boolean(current.improvedPrompt || current.error || current.isLoading);

  const controlPanelBg = useColorModeValue('white', 'gray.800');
  const controlPanelBorder = useColorModeValue('gray.200', 'gray.700');

  // LocalStorage에서 마지막 선택 모델 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem('prompt_booster_target_model');
      if (saved && ['gpt-5', 'gemini-2.5-pro', 'claude-4-sonnet', 'claude-4-opus'].includes(saved)) {
        setSelectedTargetModel(saved as TargetModel);
      }
    } catch (error) {
      console.warn('대상 모델 설정 로드 실패:', error);
    }
  }, []);

  // 모델 변경 시 LocalStorage에 저장
  const handleTargetModelChange = (model: TargetModel) => {
    setSelectedTargetModel(model);
    try {
      localStorage.setItem('prompt_booster_target_model', model);
    } catch (error) {
      console.warn('대상 모델 설정 저장 실패:', error);
    }
  };

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
			// API 요청 생성 (서버 환경변수의 키 사용; 사용자 키는 사용하지 않음)
			const request: PromptImprovementRequest = {
				prompt,
				targetModel: selectedTargetModel,
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
        targetModel: result.targetModel,
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
      <Flex direction={{ base: 'column', xl: 'row' }} gap={6} h="full">
        <Box flex={{ base: '0 0 auto', xl: hasResult ? '0 0 45%' : '1' }}>
          <Box
            bg={controlPanelBg}
            borderRadius="2xl"
            border="1px"
            borderColor={controlPanelBorder}
            p={{ base: 4, md: 6 }}
            shadow="md"
          >
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
              mb={4}
              align={{ base: 'stretch', md: 'center' }}
            >
              <VStack align="stretch" spacing={2} flex={1}>
                <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>
                  대상 모델
                </Text>
                <HStack spacing={3} align="center">
                  <Select
                    value={selectedTargetModel}
                    onChange={(e) => handleTargetModelChange(e.target.value as TargetModel)}
                    size="sm"
                    maxW="220px"
                  >
                    <option value="gpt-5">GPT-5</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="claude-4-sonnet">Claude 4 Sonnet</option>
                    <option value="claude-4-opus">Claude 4 Opus</option>
                  </Select>
                  <ModelInfo targetModel={selectedTargetModel} />
                </HStack>
              </VStack>
              <ColorModeToggle size="sm" variant="ghost" alignSelf={{ base: 'flex-start', md: 'center' }} />
            </Stack>
            <PromptInput 
              onSubmit={handlePromptSubmit}
              isLoading={current.isLoading}
            />
          </Box>
        </Box>
        {hasResult && (
          <Box flex={{ base: '0 0 auto', xl: '1' }} minH={0} overflow="hidden">
            <PromptResult
              originalPrompt={current.originalPrompt}
              improvedPrompt={current.improvedPrompt}
              isLoading={current.isLoading}
              error={current.error}
              scoringAnalysis={scoringAnalysis}
              provider={provider}
              targetModel={selectedTargetModel}
              processingTime={processingTime}
              isDemoMode={isDemoMode}
            />
          </Box>
        )}
      </Flex>
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

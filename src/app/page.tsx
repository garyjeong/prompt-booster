'use client';

import ColorModeToggle from '@/components/ColorModeToggle';
import Layout from '@/components/Layout';
import ModelInfo from '@/components/ModelInfo';
import PromptInput from '@/components/PromptInput';
import PromptResult from '@/components/PromptResult';
import { TimeIcon } from '@chakra-ui/icons';
import { Box, Button, HStack, Select, Stack, Text, useColorModeValue, useDisclosure, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import HistoryModal from '@/components/HistoryModal';
import { ApiKeyProvider } from '@/context/ApiKeyContext';
import { PromptProvider, useCurrentPrompt, usePromptHistory } from '@/context/PromptContext';
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
  const { addToHistory } = usePromptHistory();
  const { isOpen: isHistoryOpen, onOpen: openHistory, onClose: closeHistory } = useDisclosure();

  // 점수화 데이터 상태 관리
  const [scoringAnalysis, setScoringAnalysis] = useState<PromptComparisonAnalysis | undefined>(undefined);
  const [provider, setProvider] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  
  // 대상 모델 선택 상태 관리
  const [selectedTargetModel, setSelectedTargetModel] = useState<TargetModel>('gpt-5');

  const shouldEnableResultScroll = Boolean(
    current.originalPrompt ||
    current.improvedPrompt ||
    current.error ||
    current.isLoading
  );

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
      <VStack spacing={0} align="stretch" w="full" h="full" overflow="hidden">
        {/* 상단 컨트롤 바 - 미니멀한 디자인 */}
        <Stack 
          direction={{ base: 'column', md: 'row' }}
          justify={{ base: 'flex-start', md: 'space-between' }}
          align={{ base: 'stretch', md: 'center' }}
          w="full" 
          mb={8}
          px={4}
          py={3}
          bg={useColorModeValue('gray.50', 'gray.800')}
          borderRadius="2xl"
          shadow="sm"
          spacing={{ base: 3, md: 4 }}
        >
          <HStack spacing={3} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>
              대상 모델
            </Text>
            <Select
              value={selectedTargetModel}
              onChange={(e) => handleTargetModelChange(e.target.value as TargetModel)}
              size="sm"
              w={{ base: 'full', md: '180px' }}
              borderRadius="lg"
              bg={useColorModeValue('white', 'gray.700')}
            >
              <option value="gpt-5">GPT-5</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="claude-4-sonnet">Claude 4 Sonnet</option>
              <option value="claude-4-opus">Claude 4 Opus</option>
            </Select>
            <ModelInfo targetModel={selectedTargetModel} />
          </HStack>
          <HStack spacing={2} justify={{ base: 'flex-start', md: 'flex-end' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={openHistory}
              leftIcon={<TimeIcon />}
              borderRadius="xl"
            >
              히스토리
            </Button>
            <ColorModeToggle size="sm" variant="ghost" />
          </HStack>
        </Stack>

        {/* 히스토리 모달 */}
        <HistoryModal isOpen={isHistoryOpen} onClose={closeHistory} />

        {/* 대화형 메인 영역 */}
        <VStack spacing={6} align="stretch" flex="1" overflow="hidden">
          {/* 입력 영역을 상단에 배치 */}
          <PromptInput 
            onSubmit={handlePromptSubmit}
            isLoading={current.isLoading}
          />

          {/* 개선 결과를 입력 아래로 이동 */}
          <Box
            flex="1"
            minH={0}
            overflowY={shouldEnableResultScroll ? 'auto' : 'hidden'}
            overflowX="hidden"
          >
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

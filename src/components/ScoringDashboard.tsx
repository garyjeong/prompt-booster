import React, { memo, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Badge,
  Divider,
  Flex,
  Wrap,
  WrapItem,
  Collapse,
  useDisclosure,
  Button,
  Icon,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import ScoreGradeBadge from './ScoreGradeBadge';
import ScoringCriteriaChart from './ScoringCriteriaChart';
import type { PromptComparisonAnalysis } from '@/types/scoring';

interface ScoringDashboardProps {
  scoringAnalysis: PromptComparisonAnalysis;
  provider: string;
  processingTime: number;
  isDemoMode?: boolean;
}

const ScoringDashboard: React.FC<ScoringDashboardProps> = memo(({
  scoringAnalysis,
  provider,
  processingTime,
  isDemoMode = false
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('gray.50', 'gray.700');
  
  // 모든 텍스트 색상들을 미리 정의 (조건부/콜백에서 사용)
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const scoreTextColor = useColorModeValue('gray.500', 'gray.400');
  const summaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const suggestionTextColor = useColorModeValue('gray.600', 'gray.300');
  const suggestionBorderColor = useColorModeValue('blue.200', 'blue.600');
  
  // 무거운 구조 분해를 메모이제이션
  const analysisData = useMemo(() => {
    const { improvementScore, lengthAnalysis, complexityAnalysis } = scoringAnalysis;
    return { improvementScore, lengthAnalysis, complexityAnalysis };
  }, [scoringAnalysis]);
  
  const { improvementScore, lengthAnalysis, complexityAnalysis } = analysisData;
  
  // 모드별 표시 정보 메모이제이션
  const modeInfo = useMemo(() => ({
    demo: { label: 'Demo 모드', emoji: '🎭', color: 'purple' },
    'demo-fallback': { label: 'Demo 모드 (Fallback)', emoji: '🎭', color: 'purple' },
    gemini: { label: 'AI 모드', emoji: '🤖', color: 'blue' }
  }[provider] || { label: provider, emoji: '⚡', color: 'gray' }), [provider]);
  
  // 통계 계산 메모이제이션
  const stats = useMemo(() => ({
    score: Math.round(improvementScore.overallScore * 100),
    lengthIncrease: lengthAnalysis.lengthIncreaseRatio,
    complexityIncrease: Math.round(complexityAnalysis.complexityIncrease)
  }), [improvementScore.overallScore, lengthAnalysis.lengthIncreaseRatio, complexityAnalysis.complexityIncrease]);

  return (
    <VStack spacing={6} align="stretch">
      {/* 메인 점수 카드 */}
      <Box
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        shadow="md"
        position="relative"
        overflow="hidden"
      >
        {/* 배경 그라데이션 */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="4px"
          bgGradient={`linear(to-r, ${improvementScore.grade === 'EXCELLENT' ? 'green.400, green.600' : 
            improvementScore.grade === 'GOOD' ? 'blue.400, blue.600' :
            improvementScore.grade === 'MODERATE' ? 'orange.400, orange.600' : 'red.400, red.600'})`}
        />
        
        <VStack spacing={4} align="stretch">
          {/* 헤더 */}
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              🎯 프롬프트 개선 분석
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme={modeInfo.color} variant="subtle" borderRadius="full" px={2}>
                {modeInfo.emoji} {modeInfo.label}
              </Badge>
              <Badge colorScheme="gray" variant="outline" borderRadius="full" px={2}>
                {processingTime}ms
              </Badge>
            </HStack>
          </Flex>

          {/* 메인 점수 표시 */}
          <HStack spacing={6} align="center" justify="center" py={4}>
            <VStack spacing={2}>
              <Text fontSize="4xl" fontWeight="black" 
                color={improvementScore.grade === 'EXCELLENT' ? 'green.500' : 
                       improvementScore.grade === 'GOOD' ? 'blue.500' :
                       improvementScore.grade === 'MODERATE' ? 'orange.500' : 'red.500'}>
                {stats.score}
                <Text as="span" fontSize="xl" color={scoreTextColor}>
                  점
                </Text>
              </Text>
              <ScoreGradeBadge 
                grade={improvementScore.grade}
                score={improvementScore.overallScore}
                size="lg"
              />
            </VStack>
          </HStack>

          {/* 요약 정보 */}
          <Box textAlign="center">
            <Text color={summaryTextColor} lineHeight="1.6">
              {improvementScore.summary}
            </Text>
          </Box>

          {/* Demo 모드 안내 */}
          {isDemoMode && (
            <Alert status="info" borderRadius="lg" variant="left-accent">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                🎭 Demo 모드 결과입니다. AI 모드 사용 시 더욱 정교한 분석이 가능합니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 통계 정보 */}
          <HStack spacing={4} justify="center">
            <Stat textAlign="center" bg={statBg} borderRadius="lg" p={3} minW="120px">
              <StatLabel fontSize="xs">길이 증가</StatLabel>
              <StatNumber fontSize="lg">
                ×{stats.lengthIncrease.toFixed(1)}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {lengthAnalysis.originalLength} → {lengthAnalysis.improvedLength}자
              </StatHelpText>
            </Stat>

            <Stat textAlign="center" bg={statBg} borderRadius="lg" p={3} minW="120px">
              <StatLabel fontSize="xs">복잡도 증가</StatLabel>
              <StatNumber fontSize="lg">
                +{stats.complexityIncrease}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {complexityAnalysis.originalComplexity.toFixed(1)} → {complexityAnalysis.improvedComplexity.toFixed(1)}
              </StatHelpText>
            </Stat>
          </HStack>

          {/* 주요 개선 포인트 */}
          {improvementScore.keyImprovements.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color={headingColor}>
                ✨ 주요 개선 포인트
              </Text>
              <Wrap spacing={2}>
                {improvementScore.keyImprovements.map((improvement, index) => (
                  <WrapItem key={index}>
                    <Badge 
                      colorScheme="green" 
                      variant="subtle" 
                      borderRadius="full"
                      fontSize="xs"
                      px={2}
                      py={1}
                    >
                      {improvement}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          {/* 세부 분석 토글 버튼 */}
          <Divider />
          <Flex justify="center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              rightIcon={<Icon as={isOpen ? ChevronUpIcon : ChevronDownIcon} />}
            >
              세부 분석 {isOpen ? '숨기기' : '보기'}
            </Button>
          </Flex>
        </VStack>
      </Box>

      {/* 세부 분석 (접기/펼치기) */}
      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={4} align="stretch">
          {/* 기준별 점수 차트 */}
          <ScoringCriteriaChart 
            criteriaScores={improvementScore.criteriaScores}
            showDetails={true}
          />

          {/* 추가 개선 제안 */}
          {improvementScore.nextStepSuggestions.length > 0 && (
            <Box
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
              borderRadius="xl"
              p={4}
              shadow="sm"
            >
              <Text fontSize="md" fontWeight="bold" mb={3} color={headingColor}>
                💡 추가 개선 제안
              </Text>
              <VStack spacing={2} align="stretch">
                {improvementScore.nextStepSuggestions.map((suggestion, index) => (
                  <Text
                    key={index}
                    fontSize="sm"
                    color={suggestionTextColor}
                    pl={3}
                    borderLeft="3px"
                    borderColor={suggestionBorderColor}
                    py={1}
                  >
                    {suggestion}
                  </Text>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Collapse>
    </VStack>
  );
});

ScoringDashboard.displayName = 'ScoringDashboard';

export default ScoringDashboard;

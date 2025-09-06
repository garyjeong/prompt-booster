import React, { memo, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Progress,
  Tooltip,
  useColorModeValue,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { ScoringCriteria } from '@/types/scoring';
import type { CriterionScore } from '@/types/scoring';

interface ScoringCriteriaChartProps {
  criteriaScores: CriterionScore[];
  showDetails?: boolean;
}

// 기준별 한국어 라벨과 아이콘
const CRITERIA_LABELS = {
  [ScoringCriteria.CLARITY]: { 
    label: '명확성', 
    icon: '🔍',
    description: '프롬프트가 얼마나 명확하고 이해하기 쉬운가'
  },
  [ScoringCriteria.SPECIFICITY]: { 
    label: '구체성', 
    icon: '🎯',
    description: '세부적이고 정확한 정보를 포함하는가'
  },
  [ScoringCriteria.STRUCTURE]: { 
    label: '구조화', 
    icon: '🏗️',
    description: '논리적으로 잘 구성되어 있는가'
  },
  [ScoringCriteria.COMPLETENESS]: { 
    label: '완성도', 
    icon: '✅',
    description: '필요한 모든 정보를 포함하는가'
  },
  [ScoringCriteria.ACTIONABILITY]: { 
    label: '실행가능성', 
    icon: '⚡',
    description: '실제 실행 가능한 구체적인 지시를 포함하는가'
  },
};

// 점수에 따른 색상 결정
const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'green';
  if (score >= 0.6) return 'blue';
  if (score >= 0.4) return 'orange';
  return 'red';
};

const ScoringCriteriaChart: React.FC<ScoringCriteriaChartProps> = memo(({ 
  criteriaScores,
  showDetails = true
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Progress Bar와 텍스트 색상들 미리 정의 (map 콜백에서 사용)
  const progressBg = useColorModeValue('gray.100', 'gray.700');
  const reasoningTextColor = useColorModeValue('gray.600', 'gray.400');
  const suggestionTitleColor = useColorModeValue('blue.600', 'blue.300');
  const suggestionTextColor = useColorModeValue('gray.600', 'gray.400');
  const suggestionBorderColor = useColorModeValue('blue.200', 'blue.600');
  
  // 점수 표시 계산 메모이제이션
  const displayScores = useMemo(() => 
    criteriaScores.map(score => ({
      ...score,
      percentage: Math.round(score.score * 100),
      confidencePercentage: Math.round(score.confidence * 100)
    }))
  , [criteriaScores]);

  return (
    <Box
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      shadow="sm"
    >
      <Text fontSize="md" fontWeight="bold" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>
        📊 세부 평가 기준
      </Text>

      <VStack spacing={4} align="stretch">
        {displayScores.map((criterionScore) => {
          const config = CRITERIA_LABELS[criterionScore.criterion];
          const displayScore = criterionScore.percentage;
          const scoreColor = getScoreColor(criterionScore.score);
          
          return (
            <Box key={criterionScore.criterion}>
              <Flex justify="space-between" align="center" mb={2}>
                <HStack spacing={2}>
                  <Text fontSize="sm">{config.icon}</Text>
                  <Tooltip label={config.description} hasArrow>
                    <Text fontSize="sm" fontWeight="medium" cursor="help">
                      {config.label}
                    </Text>
                  </Tooltip>
                </HStack>
                
                <HStack spacing={2}>
                  <Badge 
                    colorScheme={scoreColor} 
                    variant="subtle"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                  >
                    {displayScore}점
                  </Badge>
                  <Badge 
                    colorScheme="gray" 
                    variant="outline"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                  >
                    신뢰도 {criterionScore.confidencePercentage}%
                  </Badge>
                </HStack>
              </Flex>
              
              <Progress
                value={criterionScore.score * 100}
                colorScheme={scoreColor}
                borderRadius="full"
                size="sm"
                bg={progressBg}
              />
              
              {showDetails && criterionScore.reasoning && (
                <Text fontSize="xs" color={reasoningTextColor} mt={1}>
                  {criterionScore.reasoning}
                </Text>
              )}
              
              {showDetails && criterionScore.suggestions.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="xs" fontWeight="medium" color={suggestionTitleColor}>
                    💡 개선 제안:
                  </Text>
                  <VStack spacing={1} align="stretch" mt={1}>
                    {criterionScore.suggestions.map((suggestion, index) => (
                      <Text
                        key={index}
                        fontSize="xs"
                        color={suggestionTextColor}
                        pl={2}
                        borderLeft="2px"
                        borderColor={suggestionBorderColor}
                      >
                        {suggestion}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
});

ScoringCriteriaChart.displayName = 'ScoringCriteriaChart';

export default ScoringCriteriaChart;

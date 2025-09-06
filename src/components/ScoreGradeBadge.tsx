import React, { memo, useMemo } from 'react';
import {
  Badge,
  Text,
  HStack,
} from '@chakra-ui/react';
import type { ImprovementScore } from '@/types/scoring';

interface ScoreGradeBadgeProps {
  grade: ImprovementScore['grade'];
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

// 등급별 설정
const GRADE_CONFIG = {
  EXCELLENT: {
    label: 'EXCELLENT',
    emoji: '🏆',
    colorScheme: 'green',
    description: '최상급 프롬프트',
  },
  GOOD: {
    label: 'GOOD',
    emoji: '🥈',
    colorScheme: 'blue',
    description: '양호한 프롬프트',
  },
  MODERATE: {
    label: 'MODERATE',
    emoji: '🥉',
    colorScheme: 'orange',
    description: '보통 프롬프트',
  },
  POOR: {
    label: 'POOR',
    emoji: '❌',
    colorScheme: 'red',
    description: '개선 필요',
  },
} as const;

const ScoreGradeBadge: React.FC<ScoreGradeBadgeProps> = memo(({
  grade,
  score,
  size = 'md'
}) => {
  // 설정과 계산 메모이제이션
  const displayData = useMemo(() => ({
    config: GRADE_CONFIG[grade],
    displayScore: Math.round(score * 100),
    badgeSize: {
      sm: { fontSize: 'xs', px: 2, py: 1 },
      md: { fontSize: 'sm', px: 3, py: 1 },
      lg: { fontSize: 'md', px: 4, py: 2 }
    }[size],
    textSize: {
      sm: 'xs',
      md: 'sm', 
      lg: 'md'
    }[size]
  }), [grade, score, size]);
  
  const { config, displayScore, badgeSize, textSize } = displayData;

  return (
    <HStack spacing={2}>
      <Badge
        colorScheme={config.colorScheme}
        variant="solid"
        borderRadius="full"
        {...badgeSize}
        textTransform="none"
        fontWeight="bold"
      >
        <HStack spacing={1}>
          <Text as="span" fontSize={textSize}>
            {config.emoji}
          </Text>
          <Text as="span" fontSize={textSize}>
            {displayScore}점
          </Text>
        </HStack>
      </Badge>
      
      <Badge
        colorScheme={config.colorScheme}
        variant="outline"
        borderRadius="full"
        {...badgeSize}
        textTransform="none"
        fontWeight="semibold"
      >
        <Text fontSize={textSize}>
          {config.label}
        </Text>
      </Badge>
    </HStack>
  );
});

ScoreGradeBadge.displayName = 'ScoreGradeBadge';

export default ScoreGradeBadge;

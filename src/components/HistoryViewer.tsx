/**
 * 프롬프트 히스토리 뷰어 컴포넌트
 */

import React, { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Card,
  CardBody,
  IconButton,
  Tooltip,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Heading,
  Divider,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import {
  SearchIcon,
  CopyIcon,
  DeleteIcon,
  TimeIcon,
  EditIcon,
} from '@chakra-ui/icons';
import { usePromptState, usePromptHistory } from '@/context/PromptContext';
import { useClipboard } from '@/hooks/useClipboard';
import { PromptSession } from '@/types/prompt';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import ScoreGradeBadge from './ScoreGradeBadge';

/**
 * 히스토리 필터 옵션
 */
interface HistoryFilter {
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'provider' | 'score';
  provider: 'all' | 'gemini' | 'demo';
}

/**
 * HistoryViewer 컴포넌트
 */
export default function HistoryViewer() {
  const state = usePromptState();
  const { clearHistory, restoreSession } = usePromptHistory();
  const { copy } = useClipboard();
  const toast = useToast();

  // 필터 상태
  const [filter, setFilter] = useState<HistoryFilter>({
    searchQuery: '',
    sortBy: 'newest',
    provider: 'all',
  });

  // 색상 테마
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  // 필터링된 히스토리
  const filteredSessions = useMemo(() => {
    let sessions = [...state.history.sessions];

    // 검색어 필터링
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      sessions = sessions.filter(
        (session) =>
          session.originalPrompt.toLowerCase().includes(query) ||
          session.improvedPrompt.toLowerCase().includes(query)
      );
    }

    // 프로바이더 필터링
    if (filter.provider !== 'all') {
      if (filter.provider === 'demo') {
        sessions = sessions.filter((session) => 
          session.provider.includes('demo') || session.isDemoMode
        );
      } else {
        sessions = sessions.filter((session) => session.provider === filter.provider);
      }
    }

    // 정렬
    sessions.sort((a, b) => {
      switch (filter.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'provider':
          return a.provider.localeCompare(b.provider);
        case 'score':
          const scoreA = a.scoringAnalysis?.improvementScore?.overallScore ?? 0;
          const scoreB = b.scoringAnalysis?.improvementScore?.overallScore ?? 0;
          return scoreB - scoreA; // 높은 점수부터
        default:
          return 0;
      }
    });

    return sessions;
  }, [state.history.sessions, filter]);

  // 프롬프트 복사
  const handleCopyPrompt = async (prompt: string, type: 'original' | 'improved') => {
    try {
      await copy(prompt);
      toast({
        title: `${type === 'original' ? '원본' : '개선된'} 프롬프트 복사됨`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: '복사 실패',
        description: '클립보드 접근에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 히스토리에서 복원
  const handleRestore = (session: PromptSession) => {
    restoreSession(session.id);
    toast({
      title: '프롬프트 복원됨',
      description: '메인 페이지에서 확인하세요.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // 히스토리 전체 삭제
  const handleClearAll = () => {
    if (window.confirm('모든 히스토리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearHistory();
      toast({
        title: '히스토리 삭제됨',
        description: '모든 히스토리가 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 로딩 상태
  if (state.isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColor}>
          히스토리를 불러오는 중...
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* 필터 및 검색 */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4}>
            <HStack w="full" spacing={4}>
              {/* 검색 */}
              <InputGroup flex={1}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="프롬프트 내용으로 검색..."
                  value={filter.searchQuery}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                />
              </InputGroup>

              {/* 정렬 */}
              <Select
                value={filter.sortBy}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    sortBy: e.target.value as HistoryFilter['sortBy'],
                  }))
                }
                w="200px"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="score">점수순</option>
                <option value="provider">프로바이더순</option>
              </Select>

              {/* 프로바이더 필터 */}
              <Select
                value={filter.provider}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    provider: e.target.value as HistoryFilter['provider'],
                  }))
                }
                w="150px"
              >
                <option value="all">모든 AI</option>
                <option value="gemini">Gemini</option>
                <option value="demo">Demo</option>
              </Select>
            </HStack>

            {/* 통계 및 액션 */}
            <HStack w="full" justify="space-between">
              <HStack spacing={4}>
                <Text fontSize="sm" color={mutedTextColor}>
                  총 {filteredSessions.length}개의 히스토리
                </Text>
                {filter.searchQuery && (
                  <Badge colorScheme="blue" variant="subtle">
                    &apos;{filter.searchQuery}&apos; 검색 중
                  </Badge>
                )}
              </HStack>

              {state.history.sessions.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                  onClick={handleClearAll}
                >
                  전체 삭제
                </Button>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* 히스토리 목록 */}
      {filteredSessions.length === 0 ? (
        <Alert status="info" rounded="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium">
              {filter.searchQuery
                ? '검색 결과가 없습니다.'
                : '아직 히스토리가 없습니다.'}
            </Text>
            <Text fontSize="sm">
              {filter.searchQuery
                ? '다른 검색어를 시도해보세요.'
                : '프롬프트를 개선하면 히스토리가 저장됩니다.'}
            </Text>
          </VStack>
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {filteredSessions.map((session) => (
            <HistoryCard
              key={session.id}
              session={session}
              onCopyOriginal={() => handleCopyPrompt(session.originalPrompt, 'original')}
              onCopyImproved={() => handleCopyPrompt(session.improvedPrompt, 'improved')}
              onRestore={() => handleRestore(session)}
              cardBg={cardBg}
              borderColor={borderColor}
              textColor={textColor}
              mutedTextColor={mutedTextColor}
            />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}

/**
 * 개별 히스토리 카드 컴포넌트
 */
interface HistoryCardProps {
  session: PromptSession;
  onCopyOriginal: () => void;
  onCopyImproved: () => void;
  onRestore: () => void;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedTextColor: string;
}

function HistoryCard({
  session,
  onCopyOriginal,
  onCopyImproved,
  onRestore,
  cardBg,
  borderColor,
  textColor,
  mutedTextColor,
}: HistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ko,
      });
    } catch {
      return '알 수 없음';
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card bg={cardBg} borderColor={borderColor} h="fit-content">
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* 헤더 */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex={1}>
              <HStack spacing={2} wrap="wrap">
                <Badge 
                  colorScheme={session.isDemoMode ? "purple" : "blue"} 
                  variant="subtle"
                >
                  {session.isDemoMode ? '🎭 Demo' : 
                   session.provider === 'gemini' ? 'Gemini' : session.provider}
                </Badge>
                
                {/* 점수 배지 */}
                {session.scoringAnalysis?.improvementScore && (
                  <ScoreGradeBadge
                    grade={session.scoringAnalysis.improvementScore.grade}
                    score={session.scoringAnalysis.improvementScore.overallScore}
                    size="sm"
                  />
                )}
                
                <HStack spacing={1} color={mutedTextColor} fontSize="xs">
                  <TimeIcon w={3} h={3} />
                  <Text>{formatTime(session.createdAt)}</Text>
                </HStack>
              </HStack>
              
              <HStack spacing={4} fontSize="xs" color={mutedTextColor}>
                {session.processingTime && (
                  <Text>처리시간: {session.processingTime}ms</Text>
                )}
                
                {/* 통계 정보 */}
                {session.scoringAnalysis?.lengthAnalysis && (
                  <Text>
                    길이: ×{session.scoringAnalysis.lengthAnalysis.lengthIncreaseRatio.toFixed(1)}
                  </Text>
                )}
                
                {session.scoringAnalysis?.complexityAnalysis && (
                  <Text>
                    복잡도: +{Math.round(session.scoringAnalysis.complexityAnalysis.complexityIncrease)}
                  </Text>
                )}
              </HStack>
            </VStack>

            <HStack spacing={1}>
              <Tooltip label="메인으로 복원">
                <IconButton
                  aria-label="복원"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={onRestore}
                />
              </Tooltip>
            </HStack>
          </HStack>

          {/* 원본 프롬프트 */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Heading size="xs" color={textColor}>
                원본 프롬프트
              </Heading>
              <Tooltip label="원본 프롬프트 복사">
                <IconButton
                  aria-label="원본 복사"
                  icon={<CopyIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={onCopyOriginal}
                />
              </Tooltip>
            </HStack>
            <Text
              fontSize="sm"
              color={textColor}
              cursor={session.originalPrompt.length > 150 ? 'pointer' : 'default'}
              onClick={() => session.originalPrompt.length > 150 && setIsExpanded(!isExpanded)}
            >
              {isExpanded || session.originalPrompt.length <= 150
                ? session.originalPrompt
                : truncateText(session.originalPrompt)}
            </Text>
          </Box>

          <Divider />

          {/* 개선된 프롬프트 */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Heading size="xs" color={textColor}>
                개선된 프롬프트
              </Heading>
              <Tooltip label="개선된 프롬프트 복사">
                <IconButton
                  aria-label="개선된 프롬프트 복사"
                  icon={<CopyIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={onCopyImproved}
                />
              </Tooltip>
            </HStack>
            <Text
              fontSize="sm"
              color={textColor}
              cursor={session.improvedPrompt.length > 150 ? 'pointer' : 'default'}
              onClick={() => session.improvedPrompt.length > 150 && setIsExpanded(!isExpanded)}
            >
              {isExpanded || session.improvedPrompt.length <= 150
                ? session.improvedPrompt
                : truncateText(session.improvedPrompt)}
            </Text>
          </Box>

          {/* 주요 개선 포인트 */}
          {session.scoringAnalysis?.improvementScore?.keyImprovements && 
           session.scoringAnalysis.improvementScore.keyImprovements.length > 0 && (
            <>
              <Divider />
              <Box>
                <Heading size="xs" color={textColor} mb={2}>
                  ✨ 주요 개선 포인트
                </Heading>
                <Wrap spacing={2}>
                  {session.scoringAnalysis.improvementScore.keyImprovements.map((improvement, index) => (
                    <WrapItem key={index}>
                      <Badge 
                        colorScheme="green" 
                        variant="subtle" 
                        fontSize="xs"
                        borderRadius="full"
                      >
                        {improvement}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </>
          )}

          {/* 확장/축소 버튼 */}
          {(session.originalPrompt.length > 150 || session.improvedPrompt.length > 150) && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              alignSelf="center"
            >
              {isExpanded ? '축소' : '전체 보기'}
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

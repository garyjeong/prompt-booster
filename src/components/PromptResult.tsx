import React, { memo, useMemo } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack,
  useColorModeValue,
  Badge,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription,
  Avatar,
  Flex
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import CopyButton from './CopyButton';

interface PromptResultProps {
  originalPrompt?: string;
  improvedPrompt?: string;
  isLoading?: boolean;
  error?: string;
}

// 타이핑 애니메이션
const typingAnimation = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
`;

const PromptResult = memo(function PromptResult({ 
  originalPrompt, 
  improvedPrompt, 
  isLoading = false,
  error
}: PromptResultProps) {
  const userBubbleBg = useColorModeValue('brand.500', 'brand.600');
  const aiBubbleBg = useColorModeValue('gray.100', 'gray.700');
  const chatBg = useColorModeValue('gray.50', 'gray.800');

  // 메모이제이션을 통한 성능 최적화
  const hasContent = useMemo(() => 
    Boolean(originalPrompt || isLoading || error), 
    [originalPrompt, isLoading, error]
  );

  const shouldShowOriginal = useMemo(() => 
    Boolean(originalPrompt), 
    [originalPrompt]
  );

  const shouldShowImproved = useMemo(() => 
    Boolean(improvedPrompt), 
    [improvedPrompt]
  );

  if (!hasContent) {
    return (
      <VStack 
        spacing={6}
        align="center"
        justify="center"
        py={20}
        px={6}
        textAlign="center"
      >
        <Box
          w="80px"
          h="80px"
          borderRadius="full"
          bg={useColorModeValue('gray.100', 'gray.700')}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="2xl"
        >
          ✨
        </Box>
        <VStack spacing={2}>
          <Text 
            fontSize="xl" 
            fontWeight="semibold"
            color={useColorModeValue('gray.700', 'gray.200')}
          >
            프롬프트를 입력해보세요
          </Text>
          <Text 
            color={useColorModeValue('gray.500', 'gray.400')}
            maxW="md"
            lineHeight="1.6"
          >
            AI가 여러분의 프롬프트를 더 효과적으로 개선해드립니다
          </Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch" py={4}>
      {/* Error Message */}
      {error && (
        <Alert 
          status="error" 
          borderRadius="xl"
          bg={useColorModeValue('red.50', 'red.900')}
          border="1px"
          borderColor={useColorModeValue('red.200', 'red.700')}
        >
          <AlertIcon />
          <AlertDescription fontSize="sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 대화 스타일 메시지들 */}
      <VStack spacing={6} align="stretch">
        {/* 사용자 메시지 (원본 프롬프트) */}
        {shouldShowOriginal && (
          <Flex justify="flex-end" w="full">
            <HStack spacing={3} maxW="85%" align="flex-end">
              <VStack spacing={1} align="flex-end" flex="1">
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  당신
                </Text>
                <Box
                  bg={userBubbleBg}
                  color="white"
                  px={4}
                  py={3}
                  borderRadius="2xl"
                  borderBottomRightRadius="md"
                  shadow="sm"
                  maxW="full"
                >
                  <Text fontSize="sm" lineHeight="1.6" wordBreak="break-word">
                    {originalPrompt}
                  </Text>
                </Box>
              </VStack>
              <Avatar
                size="sm"
                bg={userBubbleBg}
                color="white"
                name="User"
                src=""
              />
            </HStack>
          </Flex>
        )}

        {/* AI 응답 (개선된 프롬프트) */}
        <Flex justify="flex-start" w="full">
          <HStack spacing={3} maxW="85%" align="flex-end">
            <Avatar
              size="sm"
              bg="gray.600"
              color="white"
              name="AI Assistant"
              src=""
            >
              ✨
            </Avatar>
            <VStack spacing={1} align="flex-start" flex="1">
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                Prompt Booster AI
              </Text>
              <Box
                bg={aiBubbleBg}
                px={4}
                py={3}
                borderRadius="2xl"
                borderBottomLeftRadius="md"
                shadow="sm"
                maxW="full"
                position="relative"
              >
                {isLoading ? (
                  <VStack spacing={2} align="flex-start">
                    <HStack spacing={1}>
                      <Box
                        w="6px"
                        h="6px"
                        bg="gray.400"
                        borderRadius="full"
                        animation={`${typingAnimation} 1.4s infinite ease-in-out`}
                      />
                      <Box
                        w="6px"
                        h="6px"
                        bg="gray.400"
                        borderRadius="full"
                        animation={`${typingAnimation} 1.4s infinite ease-in-out 0.2s`}
                      />
                      <Box
                        w="6px"
                        h="6px"
                        bg="gray.400"
                        borderRadius="full"
                        animation={`${typingAnimation} 1.4s infinite ease-in-out 0.4s`}
                      />
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      프롬프트를 개선하고 있습니다...
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={3} align="flex-start">
                    <Text 
                      fontSize="sm" 
                      lineHeight="1.6"
                      wordBreak="break-word"
                      color={useColorModeValue('gray.800', 'gray.200')}
                    >
                      {improvedPrompt || '프롬프트를 개선하는 중입니다...'}
                    </Text>
                    
                    {shouldShowImproved && (
                      <CopyButton
                        text={improvedPrompt!}
                        size="xs"
                        variant="ghost"
                        colorScheme="gray"
                        fontSize="xs"
                        h="auto"
                        py={1}
                        px={2}
                        borderRadius="md"
                        successTitle="복사 완료!"
                        successDescription="개선된 프롬프트가 클립보드에 복사되었습니다."
                        copiedText="복사됨!"
                        tooltip="클립보드에 복사"
                        copiedTooltip="복사 완료!"
                      >
                        📋 복사
                      </CopyButton>
                    )}
                  </VStack>
                )}
              </Box>
            </VStack>
          </HStack>
        </Flex>
      </VStack>
    </VStack>
  );
});

export default PromptResult;

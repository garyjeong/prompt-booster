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
  AlertDescription
} from '@chakra-ui/react';
import CopyButton from './CopyButton';

interface PromptResultProps {
  originalPrompt?: string;
  improvedPrompt?: string;
  isLoading?: boolean;
  error?: string;
}

const PromptResult = memo(function PromptResult({ 
  originalPrompt, 
  improvedPrompt, 
  isLoading = false,
  error
}: PromptResultProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
      <Box 
        bg={bgColor} 
        p={{ base: 4, md: 6 }}
        borderRadius={{ base: "md", md: "lg" }}
        border="1px" 
        borderColor={borderColor}
        shadow="sm"
        textAlign="center"
      >
        <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>
          프롬프트를 입력하고 개선 버튼을 클릭하면 결과가 여기에 표시됩니다.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
      {/* Error Message */}
      {error && (
        <Alert status="error" borderRadius={{ base: "md", md: "md" }}>
          <AlertIcon />
          <AlertDescription fontSize={{ base: "sm", md: "md" }}>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Original Prompt */}
      {shouldShowOriginal && (
        <Box 
          bg={bgColor} 
          p={{ base: 3, md: 4 }}
          borderRadius={{ base: "md", md: "lg" }}
          border="1px" 
          borderColor={borderColor}
        >
          <HStack justify="space-between" mb={{ base: 2, md: 2 }} align="start">
            <Text 
              fontSize={{ base: "xs", md: "sm" }} 
              fontWeight="semibold" 
              color="gray.600"
            >
              원본 프롬프트
            </Text>
            <Badge colorScheme="gray" size="sm">원본</Badge>
          </HStack>
          <Text 
            fontSize={{ base: "sm", md: "sm" }} 
            color="gray.700"
            lineHeight="1.5"
            wordBreak="break-word"
          >
            {originalPrompt}
          </Text>
        </Box>
      )}

      {/* Improved Prompt */}
      <Box 
        bg={bgColor} 
        p={{ base: 4, md: 6 }}
        borderRadius={{ base: "md", md: "lg" }}
        border="1px" 
        borderColor={borderColor}
        shadow="sm"
      >
        <HStack justify="space-between" mb={{ base: 3, md: 4 }} align="start">
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
            개선된 프롬프트
          </Text>
          {shouldShowImproved && (
            <Badge colorScheme="green" size="sm">개선됨</Badge>
          )}
        </HStack>

        {isLoading ? (
          <VStack spacing={2} align="stretch">
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="16px" width="60%" />
          </VStack>
        ) : (
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            <Text 
              fontSize={{ base: "sm", md: "md" }} 
              lineHeight="1.6"
              wordBreak="break-word"
            >
              {improvedPrompt || '프롬프트를 개선하는 중입니다...'}
            </Text>
            
            {shouldShowImproved && (
              <CopyButton
                text={improvedPrompt!}
                colorScheme="green"
                variant="outline"
                size={{ base: "sm", md: "sm" }}
                alignSelf={{ base: "stretch", sm: "flex-start" }}
                w={{ base: "full", sm: "auto" }}
                h={{ base: "40px", sm: "auto" }}
                successTitle="복사 완료!"
                successDescription="개선된 프롬프트가 클립보드에 복사되었습니다."
                copiedText="복사됨!"
                enableKeyboardShortcut={true}
                shortcutScope="global"
                tooltip="개선된 프롬프트를 클립보드에 복사"
                copiedTooltip="복사 완료!"
              >
                클립보드에 복사
              </CopyButton>
            )}
          </VStack>
        )}
      </Box>
    </VStack>
  );
});

export default PromptResult;

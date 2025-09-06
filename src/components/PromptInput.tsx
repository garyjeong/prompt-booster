import React, { memo, useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Textarea, 
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  useColorModeValue,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { useIsDemoMode } from '@/context/ApiKeyContext';

interface PromptInputProps {
  onSubmit?: (prompt: string) => void;
  isLoading?: boolean;
}

const DEMO_MODE_MAX_LENGTH = 2000; // 서버 API 모드 최대 글자 수 (API 라우트와 동일)

const PromptInput = memo(function PromptInput({ onSubmit, isLoading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const isDemoMode = useIsDemoMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Alert 색상들 (조건부 렌더링 밖에서 미리 정의)
  const alertBg = useColorModeValue('blue.50', 'blue.900');
  const alertBorderColor = useColorModeValue('blue.200', 'blue.700');
  const progressBg = useColorModeValue('gray.200', 'gray.600');

  // 데모 모드에서 입력 제한 처리 (useCallback으로 최적화)
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (isDemoMode && newValue.length > DEMO_MODE_MAX_LENGTH) {
      // 데모 모드에서는 최대 글자 수 제한
      return;
    }
    
    setPrompt(newValue);
  }, [isDemoMode]);

  const handleSubmit = useCallback(() => {
    if (prompt.trim() && onSubmit) {
      onSubmit(prompt.trim());
    }
  }, [prompt, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // 현재 글자 수와 진행률 계산 (useMemo로 최적화)
  const currentLength = prompt.length;
  
  const progressValue = useMemo(() => 
    isDemoMode ? (currentLength / DEMO_MODE_MAX_LENGTH) * 100 : 0,
    [isDemoMode, currentLength]
  );
  
  const isNearLimit = useMemo(() => 
    isDemoMode && currentLength > DEMO_MODE_MAX_LENGTH * 0.8,
    [isDemoMode, currentLength]
  );

  const placeholderText = useMemo(() => 
    isDemoMode 
      ? `서버 API 모드: 최대 ${DEMO_MODE_MAX_LENGTH}자 (예: 리액트에서 useState를 사용하는 방법을 자세히 설명해줘)`
      : "예: 리액트에서 useState를 사용하는 방법을 자세히 설명해줘",
    [isDemoMode]
  );

  return (
    <VStack spacing={4} align="stretch">
      {/* 데모 모드 알림 - 간소화 */}
      {isDemoMode && (
        <Alert 
          status="info" 
          borderRadius="xl"
          bg={alertBg}
          border="1px"
          borderColor={alertBorderColor}
        >
          <AlertIcon />
          <AlertDescription fontSize="sm">
            <Text>
              <strong>서버 API 모드</strong> • 개인 API 키를 설정하여 더 많은 기능을 사용해보세요
            </Text>
          </AlertDescription>
        </Alert>
      )}

      {/* 모던 채팅 스타일 입력 영역 */}
      <Box
        bg={bgColor}
        borderRadius="2xl"
        border="1px"
        borderColor={isNearLimit ? "orange.300" : borderColor}
        shadow="lg"
        transition="all 0.2s ease"
        _focusWithin={{
          borderColor: isNearLimit ? "orange.400" : "brand.400",
          shadow: "xl",
          transform: "translateY(-1px)"
        }}
        overflow="hidden"
      >
        <VStack spacing={0} align="stretch">
          {/* 텍스트 입력 영역 */}
          <Box position="relative">
            <Textarea
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              minHeight="120px"
              maxHeight="300px"
              fontSize="md"
              fontWeight="medium"
              lineHeight="1.6"
              border="none"
              resize="none"
              isDisabled={isLoading}
              bg="transparent"
              _focus={{
                boxShadow: "none",
                outline: "none"
              }}
              _placeholder={{
                color: useColorModeValue('gray.400', 'gray.500')
              }}
              px={6}
              py={5}
              pr={16} // 전송 버튼 공간 확보
            />
            
            {/* 통합된 전송 버튼 */}
            <Box position="absolute" bottom={4} right={4}>
              <Tooltip 
                label={prompt.trim() ? "프롬프트 개선하기" : "프롬프트를 입력해주세요"}
                hasArrow
              >
                <IconButton
                  aria-label="프롬프트 전송"
                  icon={<ArrowUpIcon />}
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={!prompt.trim() || isLoading}
                  size="sm"
                  colorScheme="brand"
                  borderRadius="xl"
                  bg={prompt.trim() ? "brand.500" : "gray.300"}
                  color="white"
                  _hover={{
                    bg: prompt.trim() ? "brand.600" : "gray.400",
                    transform: "scale(1.05)"
                  }}
                  _active={{
                    transform: "scale(0.95)"
                  }}
                  transition="all 0.15s ease"
                />
              </Tooltip>
            </Box>
          </Box>

          {/* 하단 정보 바 */}
          <HStack 
            justify="space-between" 
            align="center"
            px={6}
            py={3}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderTop="1px"
            borderColor={borderColor}
          >
            <HStack spacing={4}>
              <Text fontSize="xs" color="gray.500">
                Ctrl+Enter로 전송
              </Text>
              {isDemoMode && (
                <Text 
                  fontSize="xs"
                  color={isNearLimit ? "orange.500" : "gray.500"}
                  fontWeight="medium"
                >
                  {currentLength}/{DEMO_MODE_MAX_LENGTH}자
                </Text>
              )}
            </HStack>
            
            {/* 캐릭터 제한 프로그레스 (데모 모드에서만) */}
            {isDemoMode && (
              <Box w="60px">
                <Progress
                  value={progressValue}
                  size="sm"
                  colorScheme={isNearLimit ? "orange" : "brand"}
                  borderRadius="full"
                  bg={progressBg}
                />
              </Box>
            )}
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
});

export default PromptInput;

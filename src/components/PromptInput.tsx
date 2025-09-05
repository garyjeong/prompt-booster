import React, { memo, useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Button, 
  FormControl,
  FormLabel,
  Textarea, 
  VStack,
  Stack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
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
    <Box 
      bg={bgColor} 
      p={{ base: 4, md: 6 }} 
      borderRadius={{ base: "md", md: "lg" }}
      border="1px" 
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
        {/* 데모 모드 알림 */}
        {isDemoMode && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              <Text>
                <strong>서버 API Key 모드:</strong> 서버에서 제공하는 AI API를 사용 중입니다. 
                개인 API Key를 설정하면 더 많은 기능을 사용할 수 있습니다.
              </Text>
            </AlertDescription>
          </Alert>
        )}

        <FormControl>
          <FormLabel htmlFor="prompt-input" fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
            <Stack 
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "start", sm: "center" }}
              spacing={{ base: 1, sm: 0 }}
            >
              <Text>원본 프롬프트를 입력하세요</Text>
              {isDemoMode && (
                <Text 
                  fontSize={{ base: "xs", md: "sm" }}
                  color={isNearLimit ? "orange.500" : "gray.500"}
                  fontWeight="normal"
                >
                  {currentLength}/{DEMO_MODE_MAX_LENGTH}자
                </Text>
              )}
            </Stack>
          </FormLabel>
          
          <Textarea
            id="prompt-input"
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            minHeight={{ base: "100px", md: "120px" }}
            fontSize={{ base: "sm", md: "md" }}
            resize="vertical"
            isDisabled={isLoading}
            borderColor={isNearLimit ? "orange.300" : borderColor}
            _focus={isNearLimit ? { borderColor: "orange.500" } : undefined}
          />

          {/* 데모 모드 프로그레스 바 */}
          {isDemoMode && (
            <Progress
              value={progressValue}
              size="sm"
              mt={2}
              colorScheme={isNearLimit ? "orange" : "blue"}
              borderRadius="full"
            />
          )}

          <Text fontSize="xs" color="gray.500" mt={2} display={{ base: "none", sm: "block" }}>
            Ctrl+Enter 또는 Cmd+Enter로 빠르게 전송할 수 있습니다
          </Text>
        </FormControl>

        <Button
          colorScheme="blue"
          size={{ base: "md", md: "lg" }}
          h={{ base: "48px", md: "auto" }}
          fontSize={{ base: "sm", md: "md" }}
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText="프롬프트 개선 중..."
          isDisabled={!prompt.trim() || isLoading}
          w="full"
        >
          프롬프트 개선하기
        </Button>
      </VStack>
    </Box>
  );
});

export default PromptInput;

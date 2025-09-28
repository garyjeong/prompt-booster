import { ArrowUpIcon } from '@chakra-ui/icons';
import {
    Box,
    HStack,
    IconButton,
    Text,
    Textarea,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import React, { memo, useCallback, useMemo, useState } from 'react';

interface PromptInputProps {
  onSubmit?: (prompt: string) => void;
  isLoading?: boolean;
}

const MAX_LENGTH = 1000;
const MIN_LENGTH = 100;

const PromptInput = memo(function PromptInput({ onSubmit, isLoading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 입력 길이 제한 처리
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue.length > MAX_LENGTH ? newValue.slice(0, MAX_LENGTH) : newValue);
  }, []);

  const handleSubmit = useCallback(() => {
    if (onSubmit && prompt.trim().length >= MIN_LENGTH) {
      onSubmit(prompt.trim());
    }
  }, [prompt, onSubmit]);

  // 현재 글자 수와 진행률 계산 (useMemo로 최적화)
  const currentLength = prompt.length;
  const isNearLimit = useMemo(() => currentLength > MAX_LENGTH * 0.9, [currentLength]);
  const canSubmit = useMemo(() => currentLength >= MIN_LENGTH, [currentLength]);

  const placeholderText = useMemo(() =>
    "예: 리액트에서 useState를 사용하는 방법을 자세히 설명해줘",
    []
  );

  return (
    <VStack spacing={4} align="stretch">
      {/* 데모/서버 모드 안내 제거 */}

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
                label={canSubmit ? "프롬프트 개선하기" : `${MIN_LENGTH}자 이상 입력해주세요`}
                hasArrow
              >
                <IconButton
                  aria-label="프롬프트 전송"
                  icon={<ArrowUpIcon />}
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={!canSubmit || isLoading}
                  size="sm"
                  colorScheme="brand"
                  borderRadius="xl"
                  bg={canSubmit ? "brand.500" : "gray.300"}
                  color="white"
                  _hover={{
                    bg: canSubmit ? "brand.600" : "gray.400",
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
            align={{ base: 'stretch', sm: 'center' }}
            direction={{ base: 'column', sm: 'row' }}
            px={6}
            py={3}
            bg={bgColor}
            spacing={{ base: 2, sm: 4 }}
            flexWrap="wrap"
          >
            <HStack spacing={4} flexWrap="wrap">
              <Text fontSize="xs" color={isNearLimit ? "orange.500" : "gray.500"} fontWeight="medium">
                {currentLength}/{MAX_LENGTH}자
              </Text>
              <Text fontSize="xs" color={canSubmit ? "brand.600" : "gray.500"}>
                {canSubmit ? '전송 가능' : `${MIN_LENGTH}자 이상 입력 시 전송 가능`}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
});

export default PromptInput;

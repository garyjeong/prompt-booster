/**
 * 채팅 입력 컴포넌트
 * 하단 고정 입력창
 */

'use client';

import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
    Box,
    HStack,
    IconButton,
    Text,
    Textarea,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { KeyboardEvent, memo, useState } from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  isComplete?: boolean;
}

const ChatInput = memo(function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = '메시지를 입력하세요...',
  isComplete = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800'); // Input area background
  const textareaBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const textareaBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const hintColor = useColorModeValue('gray.400', 'gray.500');

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // 자동 높이 조절
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <Box
      borderTop="1px solid"
      borderColor={borderColor}
      bg={bg}
      px={6}
      pt={4}
      pb={6}
    >
      <VStack align="stretch" spacing={3}>
        {isComplete && (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            모든 질문이 완료되었습니다. 문서 생성을 시작할 수 있습니다.
          </Text>
        )}
        
        <HStack spacing={3} align="flex-end">
          <Textarea
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            resize="none"
            minH="50px"
            maxH="120px"
            bg={textareaBg}
            border="1px solid"
            borderColor={textareaBorder}
            borderRadius="xl"
            _focus={{
              borderColor: 'brand.500',
              bg: useColorModeValue('white', 'whiteAlpha.200'),
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            }}
            _hover={{
              borderColor: 'brand.400',
            }}
            fontSize="md"
            rows={1}
            overflowY="auto"
            py={3}
            px={4}
          />
          <IconButton
            aria-label="전송"
            icon={<ArrowForwardIcon />}
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!message.trim() || isLoading}
            size="lg"
            borderRadius="full"
            flexShrink={0}
            h="50px"
            w="50px"
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'md',
            }}
            transition="all 0.2s"
          />
        </HStack>
        
        <Text fontSize="xs" color={hintColor} textAlign="center">
          Enter로 전송, Shift+Enter로 줄바꿈
        </Text>
      </VStack>
    </Box>
  );
});

export default ChatInput;


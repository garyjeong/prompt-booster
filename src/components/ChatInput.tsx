/**
 * 채팅 입력 컴포넌트
 * 하단 고정 입력창
 */

'use client';

import {
  Box,
  HStack,
  Textarea,
  IconButton,
  VStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useState, memo, KeyboardEvent } from 'react';

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
      borderColor="gray.200"
      bg="white"
      px={4}
      py={4}
    >
      <VStack align="stretch" spacing={2}>
        {isComplete && (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            모든 질문이 완료되었습니다. 문서 생성을 시작할 수 있습니다.
          </Text>
        )}
        
        <HStack spacing={2} align="flex-end">
          <Textarea
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            resize="none"
            minH="60px"
            maxH="120px"
            borderColor="gray.300"
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            }}
            fontSize="sm"
            rows={1}
            overflowY="auto"
          />
          <IconButton
            aria-label="전송"
            icon={<ArrowForwardIcon />}
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!message.trim() || isLoading}
            size="md"
            borderRadius="full"
            flexShrink={0}
          />
        </HStack>
        
        <Text fontSize="xs" color="gray.400" textAlign="right">
          Enter로 전송, Shift+Enter로 줄바꿈
        </Text>
      </VStack>
    </Box>
  );
});

export default ChatInput;


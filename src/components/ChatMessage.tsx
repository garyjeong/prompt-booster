/**
 * 채팅 메시지 버블 컴포넌트
 * 메신저 스타일 - 사용자 메시지 타임스탬프 좌측 배치
 */

'use client';

import {
  Box,
  Text,
  HStack,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { memo } from 'react';
import { ChatIcon } from '@chakra-ui/icons';

interface ChatMessageProps {
  message: string;
  isBot?: boolean;
  timestamp?: Date | string;
}

const ChatMessage = memo(function ChatMessage({
  message,
  isBot = false,
  timestamp,
}: ChatMessageProps) {
  const formatTime = (date?: Date | string) => {
    if (!date) return '';
    
    // 문자열인 경우 Date 객체로 변환
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // 유효한 Date 객체인지 확인
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '';
    }
    
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <Flex
      justify={isBot ? 'flex-start' : 'flex-end'}
      w="full"
      px={4}
      py={2}
      align="flex-start"
    >
      <HStack
        align="flex-start"
        spacing={3}
        maxW="85%"
      >
        {/* 봇 메시지: [아이콘] [메시지 버블] [타임스탬프] */}
        {isBot && (
          <>
            {/* 챗봇 아이콘 */}
            <Icon
              as={ChatIcon}
              w={5}
              h={5}
              color="brand.500"
              flexShrink={0}
              mt={1}
              opacity={0.7}
            />

            {/* 메시지 버블 */}
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              bg="gray.50"
              color="gray.900"
              position="relative"
              wordBreak="break-word"
              boxShadow="0 1px 2px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.200"
              transition="all 0.2s"
              _hover={{
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Text
                fontSize="15px"
                lineHeight="1.6"
                whiteSpace="pre-wrap"
                fontWeight="400"
                letterSpacing="-0.01em"
              >
                {message}
              </Text>
            </Box>

            {/* 타임스탬프 */}
            {timestamp && (
              <Text
                fontSize="11px"
                color="gray.400"
                fontWeight="500"
                letterSpacing="0.01em"
                flexShrink={0}
                pt={1}
              >
                {formatTime(timestamp)}
              </Text>
            )}
          </>
        )}

        {/* 사용자 메시지: [타임스탬프] [메시지 버블] */}
        {!isBot && (
          <>
            {/* 타임스탬프 - 좌측 */}
            {timestamp && (
              <Text
                fontSize="11px"
                color="gray.400"
                fontWeight="500"
                letterSpacing="0.01em"
                flexShrink={0}
                pt={1}
              >
                {formatTime(timestamp)}
              </Text>
            )}

            {/* 메시지 버블 */}
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              bg="brand.500"
              color="white"
              position="relative"
              wordBreak="break-word"
              boxShadow="0 2px 8px rgba(98, 125, 152, 0.15)"
              transition="all 0.2s"
              _hover={{
                boxShadow: '0 4px 12px rgba(98, 125, 152, 0.2)',
              }}
            >
              <Text
                fontSize="15px"
                lineHeight="1.6"
                whiteSpace="pre-wrap"
                fontWeight="400"
                letterSpacing="-0.01em"
              >
                {message}
              </Text>
            </Box>
          </>
        )}
      </HStack>
    </Flex>
  );
});

export default ChatMessage;

/**
 * 채팅 메시지 버블 컴포넌트
 * 메신저 스타일 - 사용자 메시지 타임스탬프 좌측 배치
 */

'use client';

import { ChatIcon } from '@chakra-ui/icons';
import {
    Box,
    Flex,
    HStack,
    Icon,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { memo } from 'react';

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
  // Colors
  const botBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const botColor = useColorModeValue('gray.800', 'gray.100');
  const botBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const botIconColor = useColorModeValue('brand.500', 'brand.400');
  
  const userBg = useColorModeValue('brand.500', 'brand.600');
  const userColor = 'white';
  const userShadow = useColorModeValue(
    '0 2px 8px rgba(0, 112, 74, 0.15)', 
    '0 2px 8px rgba(0, 0, 0, 0.4)'
  );

  const timestampColor = useColorModeValue('gray.400', 'gray.500');

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
              color={botIconColor}
              flexShrink={0}
              mt={1}
              opacity={0.9}
            />

            {/* 메시지 버블 */}
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              borderTopLeftRadius="sm"
              bg={botBg}
              color={botColor}
              position="relative"
              wordBreak="break-word"
              boxShadow="sm"
              border="1px solid"
              borderColor={botBorder}
              transition="all 0.2s"
              _hover={{
                boxShadow: 'md',
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
                color={timestampColor}
                fontWeight="500"
                letterSpacing="0.01em"
                flexShrink={0}
                pt={1}
                alignSelf="flex-end"
                pb={1}
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
                color={timestampColor}
                fontWeight="500"
                letterSpacing="0.01em"
                flexShrink={0}
                pt={1}
                alignSelf="flex-end"
                pb={1}
              >
                {formatTime(timestamp)}
              </Text>
            )}

            {/* 메시지 버블 */}
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              borderTopRightRadius="sm"
              bg={userBg}
              color={userColor}
              position="relative"
              wordBreak="break-word"
              boxShadow={userShadow}
              transition="all 0.2s"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
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

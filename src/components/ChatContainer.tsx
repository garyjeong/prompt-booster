/**
 * 채팅 컨테이너 컴포넌트
 * 스크롤 가능한 메시지 영역
 */

'use client';

import {
  Box,
  VStack,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { memo, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import type { QuestionAnswer } from '@/types/chat';

interface ChatContainerProps {
  questionAnswers: QuestionAnswer[];
  currentQuestion?: string;
  isLoading?: boolean;
}

const ChatContainer = memo(function ChatContainer({
  questionAnswers,
  currentQuestion,
  isLoading = false,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevQuestionAnswersLength = useRef(questionAnswers.length);

  useEffect(() => {
    if (scrollRef.current) {
      // 새 메시지가 추가되었을 때만 하단으로 스크롤
      // 초기 로드나 질문만 변경된 경우에는 스크롤하지 않음
      const hasNewMessage = questionAnswers.length > prevQuestionAnswersLength.current;
      
      if (hasNewMessage) {
        // 새 메시지 추가 시 하단으로 스크롤
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      } else if (questionAnswers.length === 0 && currentQuestion) {
        // 초기 질문만 있을 때는 상단 유지
        scrollRef.current.scrollTop = 0;
      }
      
      prevQuestionAnswersLength.current = questionAnswers.length;
    }
  }, [questionAnswers, currentQuestion, isLoading]);

  return (
    <Box
      ref={scrollRef}
      flex={1}
      overflowY="auto"
      px={4}
      py={6}
      bg="white"
      css={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#d4d4d4',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a3a3a3',
        },
      }}
    >
      <VStack align="stretch" spacing={3} w="full">
        {/* 현재 질문 (봇 메시지) - 히스토리 위에 표시 */}
        {currentQuestion && questionAnswers.length === 0 && !isLoading && (
          <ChatMessage
            message={currentQuestion}
            isBot={true}
            timestamp={new Date()}
          />
        )}

        {/* 히스토리 메시지들 */}
        {questionAnswers.map((qa, index) => (
          <VStack key={qa.id || index} align="stretch" spacing={3} w="full">
            {/* 질문 (봇 메시지) */}
            <ChatMessage
              message={qa.question}
              isBot={true}
              timestamp={qa.createdAt}
            />
            
            {/* 답변 (사용자 메시지) */}
            <ChatMessage
              message={qa.answer}
              isBot={false}
              timestamp={qa.updatedAt}
            />
          </VStack>
        ))}

        {/* 다음 질문 (봇 메시지) - 히스토리 아래에 표시 */}
        {currentQuestion && questionAnswers.length > 0 && !isLoading && (
          <ChatMessage
            message={currentQuestion}
            isBot={true}
            timestamp={new Date()}
          />
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <Flex justify="flex-start" px={4} py={2}>
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="0 1px 2px rgba(0, 0, 0, 0.05)"
            >
              <Spinner size="sm" thickness="2px" color="brand.500" />
            </Box>
          </Flex>
        )}
      </VStack>
    </Box>
  );
});

export default ChatContainer;


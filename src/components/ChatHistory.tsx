/**
 * 채팅 히스토리 컴포넌트
 * 미니멀 스타일
 */

'use client';

import {
  VStack,
  Text,
  IconButton,
  Box,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { memo } from 'react';
import type { QuestionAnswer } from '@/types/chat';

interface ChatHistoryProps {
  questionAnswers: QuestionAnswer[];
  onEditAnswer: (order: number) => void;
}

const ChatHistory = memo(function ChatHistory({
  questionAnswers,
  onEditAnswer,
}: ChatHistoryProps) {
  if (questionAnswers.length === 0) {
    return null;
  }

  return (
    <VStack align="stretch" spacing={6} w="full">
      <Text 
        fontSize="sm" 
        fontWeight="600" 
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        질문 히스토리
      </Text>

      <VStack align="stretch" spacing={6} divider={<Divider />}>
        {questionAnswers.map((qa, index) => (
          <Box 
            key={qa.id || index}
            className="fade-in"
            style={{
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
            }}
          >
            <VStack align="stretch" spacing={3}>
              {/* 질문 */}
              <Box>
                <HStack justify="space-between" align="start" mb={1}>
                  <Text 
                    fontSize="xs" 
                    fontWeight="600" 
                    color="brand.500"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    질문 {qa.order}
                  </Text>
                  <IconButton
                    aria-label="답변 수정"
                    icon={<EditIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={() => onEditAnswer(qa.order)}
                    opacity={0.5}
                    _hover={{ opacity: 1 }}
                  />
                </HStack>
                <Text 
                  fontSize="md" 
                  fontWeight="500" 
                  color="gray.900"
                  lineHeight="1.6"
                >
                  {qa.question}
                </Text>
              </Box>

              {/* 답변 */}
              <Box
                pl={4}
                borderLeft="2px solid"
                borderColor="gray.200"
              >
                <Text 
                  fontSize="sm" 
                  color="gray.600" 
                  whiteSpace="pre-wrap"
                  lineHeight="1.7"
                >
                  {qa.answer}
                </Text>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
});

export default ChatHistory;

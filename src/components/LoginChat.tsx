/**
 * 채팅 형식 로그인 컴포넌트
 */

'use client';

import {
  Box,
  Text,
  Flex,
  Button,
  VStack,
} from '@chakra-ui/react';
import { memo, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { QuestionAnswer } from '@/types/chat';

interface LoginChatProps {
  onComplete: () => void;
  onCancel: () => void;
}

type LoginStep = 'oauth' | 'complete';

const LoginChat = memo(function LoginChat({
  onComplete,
  onCancel,
}: LoginChatProps) {
  const [step, setStep] = useState<LoginStep>('oauth');
  const [loginHistory, setLoginHistory] = useState<QuestionAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('Google 계정으로 로그인하시겠습니까? (예/아니오)');

  const handleAnswerSubmit = async (answer: string) => {
    if (step === 'oauth') {
      const answerLower = answer.toLowerCase().trim();
      const newQA: QuestionAnswer = {
        id: crypto.randomUUID(),
        question: currentQuestion,
        answer,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLoginHistory([newQA]);

      if (answerLower === '예' || answerLower === 'yes' || answerLower === 'y' || answerLower === '구글') {
        // Google OAuth 로그인
        onComplete();
        setStep('complete');
      } else {
        // 거부한 경우 다시 질문
        setCurrentQuestion('Google 계정으로만 로그인할 수 있습니다. Google 계정으로 로그인하시겠습니까? (예/아니오)');
      }
    }
  };

  return (
    <Flex
      direction="column"
      h="100vh"
      w="full"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
    >
      {/* 헤더 */}
      <Box
        as="header"
        py={5}
        px={6}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        flexShrink={0}
      >
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="600" color="gray.900">
            로그인
          </Text>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onCancel}
            color="gray.600"
          >
            취소
          </Button>
        </Flex>
      </Box>

      {/* 채팅 영역 */}
      <Box
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
          {/* 히스토리 메시지들 */}
          {loginHistory.map((qa, index) => (
            <VStack key={qa.id || index} align="stretch" spacing={2}>
              <ChatMessage
                message={qa.question}
                isBot={true}
                timestamp={qa.createdAt}
              />
              <ChatMessage
                message={qa.answer}
                isBot={false}
                timestamp={qa.updatedAt}
              />
            </VStack>
          ))}

          {/* 현재 질문 */}
          {step !== 'complete' && (
            <ChatMessage
              message={currentQuestion}
              isBot={true}
              timestamp={new Date()}
            />
          )}
        </VStack>
      </Box>

      {/* 입력창 */}
      {step !== 'complete' && (
        <ChatInput
          onSubmit={handleAnswerSubmit}
          placeholder="예 또는 아니오를 입력하세요..."
        />
      )}
    </Flex>
  );
});

export default LoginChat;


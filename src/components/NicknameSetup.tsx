/**
 * 닉네임 설정 컴포넌트
 * 채팅 형식으로 닉네임 입력 받기
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

interface NicknameSetupProps {
  onComplete: (nickname: string) => void;
  onCancel: () => void;
  currentNickname?: string | null;
}

type SetupStep = 'input' | 'complete';

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 20;
const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣\s_-]+$/; // 영문, 숫자, 한글, 공백, 하이픈, 언더스코어만 허용

const NicknameSetup = memo(function NicknameSetup({
  onComplete,
  onCancel,
  currentNickname,
}: NicknameSetupProps) {
  const [step, setStep] = useState<SetupStep>('input');
  const [history, setHistory] = useState<QuestionAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(
    currentNickname
      ? `현재 닉네임은 "${currentNickname}"입니다. 새로운 닉네임을 입력해주세요.`
      : '사용하실 닉네임을 입력해주세요. (2-20자, 영문/한글/숫자만 가능)'
  );
  const [isLoading, setIsLoading] = useState(false);

  const validateNickname = (nick: string): string | null => {
    const trimmed = nick.trim();
    
    if (trimmed.length < NICKNAME_MIN_LENGTH) {
      return `닉네임은 최소 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다.`;
    }
    
    if (trimmed.length > NICKNAME_MAX_LENGTH) {
      return `닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 가능합니다.`;
    }
    
    if (!NICKNAME_REGEX.test(trimmed)) {
      return '닉네임은 영문, 한글, 숫자, 공백, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.';
    }
    
    return null;
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (step === 'input') {
      const trimmed = answer.trim();
      
      // 유효성 검증
      const validationError = validateNickname(trimmed);
      if (validationError) {
        setCurrentQuestion(`${validationError}\n\n다시 입력해주세요.`);
        return;
      }
      
      setIsLoading(true);
      
      const newQA: QuestionAnswer = {
        id: crypto.randomUUID(),
        question: currentQuestion,
        answer: trimmed,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setHistory([newQA]);
      
      try {
        // 닉네임 저장 API 호출
        let response: Response;
        try {
          response = await fetch('/api/user/nickname', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname: trimmed }),
          });
        } catch (fetchError) {
          throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
        }
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          const errorMessage = 
            (typeof data?.error === 'object' && data?.error?.error)
            || (typeof data?.error === 'string' && data?.error)
            || '닉네임 저장에 실패했습니다.';
          throw new Error(errorMessage);
        }
        
        // 성공
        setCurrentQuestion(`닉네임 "${trimmed}"으로 설정되었습니다!`);
        setStep('complete');
        onComplete(trimmed);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '닉네임 저장에 실패했습니다.';
        setCurrentQuestion(`${errorMessage}\n\n다시 시도해주세요.`);
      } finally {
        setIsLoading(false);
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
            {currentNickname ? '닉네임 수정' : '닉네임 설정'}
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
          {history.map((qa, index) => (
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

          {/* 완료 메시지 */}
          {step === 'complete' && (
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
          placeholder="닉네임을 입력하세요..."
          isLoading={isLoading}
        />
      )}
    </Flex>
  );
});

export default NicknameSetup;


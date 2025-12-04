/**
 * 로그인 모달 컴포넌트
 * 채팅 인터페이스를 포함한 모달
 */

'use client';

import type { QuestionAnswer } from '@/types/chat';
import {
    Box,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type LoginStep = 'oauth' | 'complete';

const LoginModal = memo(function LoginModal({
  isOpen,
  onClose,
  onComplete,
}: LoginModalProps) {
  const [step, setStep] = useState<LoginStep>('oauth');
  const [loginHistory, setLoginHistory] = useState<QuestionAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('Google 계정으로 로그인하시겠습니까? (예/아니오)');

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setStep('oauth');
      setLoginHistory([]);
      setCurrentQuestion('Google 계정으로 로그인하시겠습니까? (예/아니오)');
    }
  }, [isOpen]);

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

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent 
        bg={bg} 
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="xl"
        maxH="80vh"
        h="600px"
      >
        <ModalHeader borderBottom="1px solid" borderColor={borderColor}>로그인</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0} display="flex" flexDirection="column">
          {/* 채팅 영역 */}
          <Box
            flex={1}
            overflowY="auto"
            px={4}
            py={6}
            bg="transparent"
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default LoginModal;

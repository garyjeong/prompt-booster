/**
 * 현재 질문 및 답변 입력 컴포넌트
 * 미니멀 스타일
 */

'use client';

import {
  VStack,
  Text,
  Textarea,
  Button,
  Box,
  Divider,
} from '@chakra-ui/react';
import { useState, memo } from 'react';

interface CurrentQuestionProps {
  question: string;
  isLoading?: boolean;
  onSubmit: (answer: string) => void;
  isComplete?: boolean;
}

const CurrentQuestion = memo(function CurrentQuestion({
  question,
  isLoading = false,
  onSubmit,
  isComplete = false,
}: CurrentQuestionProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <VStack align="stretch" spacing={6} w="full">
      {/* 질문 */}
      <Box>
        <Text 
          fontSize="2xl" 
          fontWeight="600" 
          color="gray.900"
          mb={2}
          lineHeight="1.4"
        >
          {question}
        </Text>
        {isComplete && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            모든 질문이 완료되었습니다. 문서 생성을 시작할 수 있습니다.
          </Text>
        )}
      </Box>

      <Divider />

      {/* 답변 입력 */}
      <VStack align="stretch" spacing={3}>
        <Text 
          fontSize="xs" 
          fontWeight="500" 
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wide"
        >
          답변
        </Text>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="답변을 입력하세요..."
          resize="none"
          minH="120px"
          borderColor="gray.300"
          _focus={{
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          }}
          fontSize="md"
        />
        <Text fontSize="xs" color="gray.400" textAlign="right">
          Cmd/Ctrl + Enter로 제출
        </Text>
      </VStack>

      {/* 제출 버튼 */}
      <Button
        colorScheme="brand"
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="처리 중..."
        isDisabled={!answer.trim() || isLoading}
        size="lg"
        w="full"
        py={3}
      >
        {isComplete ? '문서 생성하기' : '답변 제출'}
      </Button>
    </VStack>
  );
});

export default CurrentQuestion;

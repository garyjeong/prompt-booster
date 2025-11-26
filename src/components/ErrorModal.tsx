/**
 * 에러 모달 컴포넌트
 * API 에러 발생 시 사용자에게 표시
 */

'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Box,
  Link,
  Divider,
} from '@chakra-ui/react';
import { memo } from 'react';
import { WarningIcon } from '@chakra-ui/icons';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  error: string;
  title?: string;
}

const ErrorModal = memo(function ErrorModal({
  isOpen,
  onClose,
  onRetry,
  error,
  title = '오류 발생',
}: ErrorModalProps) {
  // 에러 타입에 따른 메시지 및 안내 분기
  const isApiKeyExpired = error.includes('OPENAI_API_KEY_EXPIRED') || error.includes('API key expired') || error.includes('invalid_api_key');
  const isApiKeyError = error.includes('OPENAI_API_KEY_ERROR');
  const isApiError = error.includes('OPENAI_API');

  const isInputDetailHint =
    error.includes('조금 더 구체적으로') ||
    error.includes('프로젝트 아이디어를 조금 더 구체적으로') ||
    error.includes('프로젝트를 한두 문장으로');

  // 사용자 친화적인 메시지 추출
  const getErrorMessage = (): string => {
    if (isApiKeyExpired) {
      return 'OpenAI API 키가 만료되었습니다.';
    }
    if (isApiKeyError) {
      return 'OpenAI API 키에 문제가 있습니다.';
    }
    if (isApiError) {
      return 'AI 서비스 연결에 실패했습니다.';
    }
    // 일반 에러 메시지에서 접두사 제거
    return error.replace(/^(OPENAI_API_\w+:|API_\w+:)\s*/i, '').trim() || '알 수 없는 오류가 발생했습니다.';
  };

  const getErrorDescription = (): string => {
    if (isApiKeyExpired) {
      return 'API 키를 갱신하거나 새로운 키를 발급받아 설정해주세요.';
    }
    if (isApiKeyError) {
      return '환경 변수 OPENAI_API_KEY를 확인하고 올바른 키를 설정해주세요.';
    }
    if (isApiError) {
      return '잠시 후 다시 시도하거나 관리자에게 문의해주세요.';
    }
    if (isInputDetailHint) {
      return '좀 더 구체적으로 작성해주세요.';
    }
    return '잠시 후 다시 시도해주세요.';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader>
          <VStack align="flex-start" spacing={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <WarningIcon color="red.500" boxSize={5} />
              <Text fontSize="lg" fontWeight="600">
                {title}
              </Text>
            </Box>
          </VStack>
        </ModalHeader>

        <Divider />

        <ModalBody py={6}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontSize="md" fontWeight="500" color="gray.800" mb={2} whiteSpace="pre-line">
                {getErrorMessage()}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {getErrorDescription()}
              </Text>
            </Box>

            {(isApiKeyExpired || isApiKeyError) && (
              <Box
                bg="blue.50"
                border="1px solid"
                borderColor="blue.200"
                borderRadius="md"
                p={4}
              >
                <Text fontSize="sm" fontWeight="600" color="blue.800" mb={2}>
                  API 키 설정 방법:
                </Text>
                <VStack align="stretch" spacing={2} fontSize="xs" color="blue.700">
                  <Text>1. <Link href="https://platform.openai.com/api-keys" isExternal color="blue.600" textDecoration="underline">
                    OpenAI Platform
                  </Link>에서 API 키 발급</Text>
                  <Text>2. 로컬 개발: .env 파일에 OPENAI_API_KEY 설정</Text>
                  <Text>3. 배포 환경: Fly.io secrets에 OPENAI_API_KEY 설정</Text>
                </VStack>
              </Box>
            )}

            {isDevelopment() && !isInputDetailHint && (
              <Box
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
                mt={2}
              >
                <Text fontSize="xs" color="gray.600" fontFamily="mono" wordBreak="break-all">
                  {error}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <Divider />

        <ModalFooter>
          <VStack w="full" spacing={2}>
            {onRetry && (
              <Button
                colorScheme="blue"
                onClick={onRetry}
                w="full"
                size="md"
              >
                다시 시도
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              w="full"
              size="md"
            >
              닫기
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

// 개발 모드 확인 헬퍼
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export default ErrorModal;


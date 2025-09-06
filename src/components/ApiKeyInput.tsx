/**
 * API 키 입력 모달 컴포넌트
 * Gemini API 키만 관리
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Link,
  Alert,
  AlertIcon,
  useDisclosure,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, SettingsIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useApiKeys } from '@/context/ApiKeyContext';

/**
 * API 키 입력 컴포넌트
 */
const ApiKeyInput = memo(function ApiKeyInput() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { apiKeys, setApiKey, removeApiKey } = useApiKeys();
  const toast = useToast();

  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');

  // 모달이 열릴 때 현재 저장된 키를 폼에 로드
  const handleOpen = useCallback(() => {
    setGeminiKey(apiKeys.gemini || '');
    onOpen();
  }, [apiKeys.gemini, onOpen]);

  // API 키 저장 (useCallback 최적화)
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Gemini 키 저장/삭제
      if (geminiKey.trim()) {
        await setApiKey('gemini', geminiKey.trim());
      } else if (apiKeys.gemini) {
        await removeApiKey('gemini');
      }

      toast({
        title: 'API 키 저장 완료',
        description: 'API 키가 성공적으로 저장되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      toast({
        title: 'API 키 저장 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [geminiKey, apiKeys.gemini, setApiKey, removeApiKey, toast, onClose]);

  // 저장 버튼 활성화 조건 (useMemo 최적화)
  const isChanged = useMemo(() => geminiKey !== (apiKeys.gemini || ''), [geminiKey, apiKeys.gemini]);
  const canSave = useMemo(() => isChanged && !isLoading, [isChanged, isLoading]);

  // 버튼 텍스트 결정 (useMemo 최적화)
  const buttonText = useMemo(() => apiKeys.gemini ? '키 관리' : 'API 키 설정', [apiKeys.gemini]);

  return (
    <>
      <Button
        leftIcon={<SettingsIcon />}
        colorScheme="blue"
        variant="outline"
        onClick={handleOpen}
        size="sm"
      >
        {buttonText}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={bgColor} mx={4}>
          <ModalHeader>API 키 설정</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* 보안 안내 */}
              <Alert status="info" rounded="md">
                <AlertIcon />
                <Text fontSize="sm">
                  API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                </Text>
              </Alert>

              {/* Gemini API 키 입력 */}
              <FormControl>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  Google Gemini API 키
                  <Link 
                    href="https://aistudio.google.com/app/apikey" 
                    isExternal 
                    color="blue.500"
                    fontSize="sm"
                  >
                    발급받기 <ExternalLinkIcon mx="2px" />
                  </Link>
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    pr="4.5rem"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showGeminiKey ? 'Gemini 키 숨기기' : 'Gemini 키 보기'}
                      icon={showGeminiKey ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* 안내 메시지 */}
              <Text fontSize="sm" color="gray.600">
                💡 Gemini API는 Google AI Studio에서 무료로 제공됩니다. 
                월 1,500회 무료 사용이 가능합니다.
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              취소
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={isLoading}
              loadingText="저장 중..."
              isDisabled={!canSave}
            >
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

export default ApiKeyInput;
'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  IconButton,
  InputGroup,
  InputRightElement,
  Divider,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon, SettingsIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useApiKeys } from '@/context/ApiKeyContext';
import { maskApiKey } from '@/lib/localstorage';

interface ApiKeyInputProps {
  /** 설정 버튼 텍스트 */
  buttonText?: string;
  /** 설정 버튼 크기 */
  buttonSize?: 'sm' | 'md' | 'lg';
}

export default function ApiKeyInput({ 
  buttonText = 'API 키 설정', 
  buttonSize = 'md' 
}: ApiKeyInputProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { apiKeys, setApiKey, removeApiKey, hasKeys } = useApiKeys();
  const toast = useToast();

  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');

  // 모달이 열릴 때 현재 저장된 키들을 폼에 로드
  const handleOpen = () => {
    setOpenaiKey(apiKeys.openai || '');
    setGeminiKey(apiKeys.gemini || '');
    onOpen();
  };

  // API 키 저장
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // OpenAI 키 저장/삭제
      if (openaiKey.trim()) {
        setApiKey('openai', openaiKey.trim());
      } else if (apiKeys.openai) {
        removeApiKey('openai');
      }

      // Gemini 키 저장/삭제
      if (geminiKey.trim()) {
        setApiKey('gemini', geminiKey.trim());
      } else if (apiKeys.gemini) {
        removeApiKey('gemini');
      }

      toast({
        title: 'API 키 저장 완료',
        description: 'API 키가 성공적으로 저장되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch {
      toast({
        title: '저장 실패',
        description: 'API 키 저장 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // API 키 검증 (기본적인 형태 검증)
  const validateApiKey = (key: string, provider: 'openai' | 'gemini'): boolean => {
    if (!key.trim()) return true; // 빈 키는 허용 (삭제 의미)

    if (provider === 'openai') {
      return key.startsWith('sk-') && key.length > 20;
    } else if (provider === 'gemini') {
      return key.length > 10; // Gemini 키는 다양한 형태일 수 있음
    }

    return false;
  };

  const isOpenaiKeyValid = validateApiKey(openaiKey, 'openai');
  const isGeminiKeyValid = validateApiKey(geminiKey, 'gemini');
  const canSave = (openaiKey.trim() || geminiKey.trim()) && isOpenaiKeyValid && isGeminiKeyValid;

  return (
    <>
      {/* 설정 버튼 */}
      <Button
        leftIcon={<SettingsIcon />}
        onClick={handleOpen}
        size={buttonSize}
        variant={hasKeys ? 'outline' : 'solid'}
        colorScheme={hasKeys ? 'green' : 'blue'}
      >
        {hasKeys ? '키 관리' : buttonText}
      </Button>

      {/* API 키 입력 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>API 키 설정</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* 안내 메시지 */}
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다. 
                  더 나은 프롬프트 개선을 위해 최소 하나의 API 키를 입력해주세요.
                </AlertDescription>
              </Alert>

              {/* OpenAI API 키 */}
              <Box>
                <FormControl isInvalid={!!openaiKey.trim() && !isOpenaiKeyValid}>
                  <FormLabel>
                    <HStack>
                      <Text>OpenAI API 키</Text>
                      <Link 
                        href="https://platform.openai.com/api-keys" 
                        isExternal 
                        fontSize="sm" 
                        color="blue.500"
                      >
                        키 발급받기 <ExternalLinkIcon mx="2px" />
                      </Link>
                    </HStack>
                  </FormLabel>
                  
                  <InputGroup>
                    <Input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      size="md"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showOpenaiKey ? '키 숨기기' : '키 보기'}
                        icon={showOpenaiKey ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  
                  {apiKeys.openai && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      현재 저장됨: {maskApiKey(apiKeys.openai)}
                    </Text>
                  )}
                  
                  {openaiKey.trim() && !isOpenaiKeyValid && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      올바른 OpenAI API 키 형식이 아닙니다 (sk-로 시작해야 함)
                    </Text>
                  )}
                </FormControl>
              </Box>

              <Divider />

              {/* Gemini API 키 */}
              <Box>
                <FormControl isInvalid={!!geminiKey.trim() && !isGeminiKeyValid}>
                  <FormLabel>
                    <HStack>
                      <Text>Google Gemini API 키</Text>
                      <Link 
                        href="https://aistudio.google.com/app/apikey" 
                        isExternal 
                        fontSize="sm" 
                        color="blue.500"
                      >
                        키 발급받기 <ExternalLinkIcon mx="2px" />
                      </Link>
                    </HStack>
                  </FormLabel>
                  
                  <InputGroup>
                    <Input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Gemini API 키를 입력하세요"
                      size="md"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showGeminiKey ? '키 숨기기' : '키 보기'}
                        icon={showGeminiKey ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  
                  {apiKeys.gemini && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      현재 저장됨: {maskApiKey(apiKeys.gemini)}
                    </Text>
                  )}
                  
                  {geminiKey.trim() && !isGeminiKeyValid && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      올바른 Gemini API 키 형식이 아닙니다
                    </Text>
                  )}
                </FormControl>
              </Box>

              {/* 데모 모드 안내 */}
              {!openaiKey.trim() && !geminiKey.trim() && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    API 키를 입력하지 않으면 데모 모드로 제한된 기능만 사용할 수 있습니다.
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
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
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

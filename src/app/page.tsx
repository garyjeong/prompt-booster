/**
 * 메인 챗봇 페이지
 * 메신저 스타일 채팅 인터페이스
 */

'use client';

import ChatContainer from '@/components/ChatContainer';
import ChatHistoryList from '@/components/ChatHistoryList';
import ChatInput from '@/components/ChatInput';
import DocumentPreview from '@/components/DocumentPreview';
import ErrorModal from '@/components/ErrorModal';
import Layout from '@/components/Layout';
import LoginModal from '@/components/LoginModal';
import Logo from '@/components/Logo';
import NicknameSetup from '@/components/NicknameSetup';
import ProjectNameSuggestions from '@/components/ProjectNameSuggestions';
import Sidebar from '@/components/Sidebar';
import TrashBinList from '@/components/TrashBinList';
import { validateInitialAnswer } from '@/lib/answer-validation';
import {
    clearSessionFromStorage,
    saveSessionToStorage,
    type ChatSessionStorage,
} from '@/lib/storage';
import type { DocumentGenerationResponse, ProjectNameSuggestion, QuestionAnswer } from '@/types/chat';
import {
    Box,
    Card,
    CardBody,
    Code,
    Flex,
    Spinner
} from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const INITIAL_QUESTION = '무엇을 만들어보고 싶으신가요?';

/**
 * API 키 표시 컴포넌트 (개발 환경에서만)
 */
function ApiKeyDisplay() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 개발 환경에서만 API 키 가져오기
    if (process.env.NODE_ENV === 'development') {
      fetch('/api/debug/api-key')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.apiKey) {
            setApiKey(data.apiKey);
          }
        })
        .catch(() => {
          // 에러 발생 시 무시
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // 프로덕션 환경이거나 로딩 중이면 표시하지 않음
  if (process.env.NODE_ENV !== 'development' || isLoading || !apiKey) {
    return null;
  }

  return (
    <Code
      fontSize="xs"
      colorScheme="gray"
      px={2}
      py={1}
      borderRadius="md"
      maxW="200px"
      isTruncated
      title={apiKey}
    >
      {apiKey.substring(0, 20)}...
    </Code>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState<string>(INITIAL_QUESTION);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showProjectNameSuggestions, setShowProjectNameSuggestions] = useState(false);
  const [projectNameSuggestions, setProjectNameSuggestions] = useState<ProjectNameSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<DocumentGenerationResponse | null>(null);
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [showLoginChat, setShowLoginChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showNicknameSetup, setShowNicknameSetup] = useState(false);
  const handleOpenHistory = () => {
    setShowHistory(true);
    setShowTrash(false);
    setShowLoginChat(false);
  };

  const handleOpenTrash = () => {
    setShowTrash(true);
    setShowHistory(false);
    setShowLoginChat(false);
  };

  const handleOpenLogin = () => {
    setShowLoginChat(true);
    setShowHistory(false);
    setShowTrash(false);
  };

  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; error: string; retryAction?: () => void }>({
    isOpen: false,
    error: '',
  });

  // 기본적으로 새 채팅으로 시작
  useEffect(() => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setQuestionAnswers([]);
    setCurrentQuestion(INITIAL_QUESTION);
    setIsComplete(false);
    setProjectDescription('');
    setDocumentPreview(null);
    setShowProjectNameSuggestions(false);
    clearSessionFromStorage();
  }, []);

  // 세션 저장 (로컬 스토리지 + DB)
  useEffect(() => {
    if (sessionId && questionAnswers.length > 0) {
      const chatSession: ChatSessionStorage = {
        sessionId,
        questionAnswers,
        currentQuestion,
        isCompleted: isComplete,
        projectDescription,
        createdAt: questionAnswers.length === 1 
          ? questionAnswers[0].createdAt || new Date()
          : new Date(),
        updatedAt: new Date(),
        title: questionAnswers[0]?.answer?.substring(0, 50) || '새 채팅',
      };
      
      // 로컬 스토리지 저장
      saveSessionToStorage(chatSession);
      
      // DB 저장 (로그인한 경우에만)
      if (status === 'authenticated' && session?.user?.id) {
        fetch('/api/chat-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chatSession),
        }).catch((error) => {
          // 네트워크 에러 처리 (로컬 스토리지는 유지되므로 사용자 경험에 영향 없음)
          // 개발 환경에서는 상세 로그, 프로덕션에서는 간단한 로그
          if (process.env.NODE_ENV === 'development') {
            console.warn('DB 세션 저장 실패 (로컬 스토리지는 유지됨):', {
              error: error instanceof Error ? error.message : String(error),
              type: error instanceof TypeError ? 'NetworkError' : 'UnknownError',
              sessionId: chatSession.sessionId,
            });
          } else {
            // 프로덕션에서는 에러 추적 서비스에 전송할 수 있음 (예: Sentry)
            console.error('DB 세션 저장 실패:', error instanceof Error ? error.message : String(error));
          }
          // 사용자에게는 알림하지 않음 (로컬 스토리지가 있으므로)
        });
      }
    }
  }, [sessionId, questionAnswers, currentQuestion, isComplete, projectDescription, status, session]);

  // 다음 질문 생성
  const handleAnswerSubmit = async (answer: string) => {
    const trimmedAnswer = answer?.trim();

    if (!trimmedAnswer) {
      return;
    }

    if (questionAnswers.length === 0) {
      const validation = validateInitialAnswer(trimmedAnswer);
      if (!validation.isValid) {
        setErrorModal({
          isOpen: true,
          error:
            validation.reason ??
            '프로젝트 아이디어를 조금 더 구체적으로 알려주시면 다음 질문을 이어갈 수 있어요.',
        });
        return;
      }
    }

    if (isComplete) {
      await handleDocumentGeneration();
      return;
    }

    setIsLoading(true);

    try {
      if (questionAnswers.length === 0) {
        setProjectDescription(trimmedAnswer);
      }

      const newQA: QuestionAnswer = {
        id: crypto.randomUUID(),
        question: currentQuestion,
        answer: trimmedAnswer,
        order: questionAnswers.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedQAs = [...questionAnswers, newQA];
      setQuestionAnswers(updatedQAs);

      let response: Response;
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            previousAnswers: updatedQAs,
              currentAnswer: trimmedAnswer,
          }),
        });
      } catch {
        // 네트워크 에러 (서버 연결 실패, 타임아웃 등)
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }

      if (!response.ok) {
        let errorData: unknown = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          // JSON 파싱 실패 시 상세 정보 로깅 (개발 환경)
          if (process.env.NODE_ENV === 'development') {
            console.error('JSON 파싱 실패:', {
              status: response.status,
              statusText: response.statusText,
              parseError: parseError instanceof Error ? parseError.message : String(parseError),
            });
          }
          throw new Error(`서버 응답을 처리할 수 없습니다. (상태 코드: ${response.status})`);
        }
        // API 응답 형식: { success: false, error: { error: string, code: string } } 또는 { success: false, error: string }
        const errorMessage = 
          (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'object' && errorData.error !== null && 'error' in errorData.error && typeof errorData.error.error === 'string' && errorData.error.error)
          || (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'string' && errorData.error)
          || '다음 질문 생성에 실패했습니다.';
        throw new Error(errorMessage);
      }

      let result: unknown;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('서버 응답이 비어있습니다.');
        }
        result = JSON.parse(text);
      } catch {
        // JSON 파싱 실패 시 상세 정보 로깅 (개발 환경)
        if (process.env.NODE_ENV === 'development') {
          console.error('JSON 파싱 실패');
        }
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }

      // 타입 가드
      if (typeof result !== 'object' || result === null || !('success' in result)) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      if (!result.success) {
        // API 응답 형식: { success: false, error: { error: string, code: string } } 또는 { success: false, error: string }
        const errorResult = result as { success: false; error: unknown };
        const errorMessage = 
          (typeof errorResult.error === 'object' && errorResult.error !== null && 'error' in errorResult.error && typeof (errorResult.error as { error: unknown }).error === 'string' && (errorResult.error as { error: string }).error)
          || (typeof errorResult.error === 'string' && errorResult.error)
          || '알 수 없는 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }

      const successResult = result as { success: true; data: { question: string; isComplete: boolean; sessionId: string } };
      setCurrentQuestion(successResult.data.question);
      setIsComplete(successResult.data.isComplete);
      setSessionId(successResult.data.sessionId);

      if (successResult.data.question.toLowerCase().includes('프로젝트 이름') || 
          successResult.data.question.toLowerCase().includes('이름')) {
        await loadProjectNameSuggestions();
      }
    } catch (error) {
      console.error('답변 제출 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      
      // 마지막 답변 제거
      setQuestionAnswers(questionAnswers);
      
      // 에러 모달 표시
      setErrorModal({
        isOpen: true,
        error: errorMessage,
        retryAction: () => {
          setErrorModal({ isOpen: false, error: '' });
          setTimeout(() => {
            handleAnswerSubmit(trimmedAnswer);
          }, 100);
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 프로젝트 이름 추천 로드
  const loadProjectNameSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setShowProjectNameSuggestions(true);

    try {
      let response: Response;
      try {
        response = await fetch('/api/project-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectDescription,
          }),
        });
      } catch {
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }

      if (!response.ok) {
        let errorData: unknown = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          // JSON 파싱 실패 시 상세 정보 로깅 (개발 환경)
          if (process.env.NODE_ENV === 'development') {
            console.error('JSON 파싱 실패:', {
              status: response.status,
              statusText: response.statusText,
              parseError: parseError instanceof Error ? parseError.message : String(parseError),
            });
          }
          throw new Error(`서버 응답을 처리할 수 없습니다. (상태 코드: ${response.status})`);
        }
        const errorMessage = 
          (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'object' && errorData.error !== null && 'error' in errorData.error && typeof errorData.error.error === 'string' && errorData.error.error)
          || (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'string' && errorData.error)
          || '프로젝트 이름 추천에 실패했습니다.';
        throw new Error(errorMessage);
      }

      let result: unknown;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('서버 응답이 비어있습니다.');
        }
        result = JSON.parse(text);
      } catch {
        // JSON 파싱 실패 시 상세 정보 로깅 (개발 환경)
        if (process.env.NODE_ENV === 'development') {
          console.error('JSON 파싱 실패');
        }
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }

      // 타입 가드
      if (typeof result !== 'object' || result === null || !('success' in result)) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      if (!result.success) {
        const errorResult = result as { success: false; error: unknown };
        const errorMessage = 
          (typeof errorResult.error === 'object' && errorResult.error !== null && 'error' in errorResult.error && typeof (errorResult.error as { error: unknown }).error === 'string' && (errorResult.error as { error: string }).error)
          || (typeof errorResult.error === 'string' && errorResult.error)
          || '알 수 없는 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }

      const successResult = result as { success: true; data: { suggestions: ProjectNameSuggestion[] } };
      setProjectNameSuggestions(successResult.data.suggestions);
    } catch (error) {
      console.error('프로젝트 이름 추천 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '프로젝트 이름 추천에 실패했습니다.';
      setShowProjectNameSuggestions(false);
      setErrorModal({
        isOpen: true,
        error: errorMessage,
        retryAction: () => {
          setErrorModal({ isOpen: false, error: '' });
          loadProjectNameSuggestions();
        },
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // 다음 추천 보기
  const handleNextSuggestions = async () => {
    await loadProjectNameSuggestions();
  };

  // 프로젝트 이름 선택
  const handleProjectNameSelect = (name: string) => {
    handleAnswerSubmit(name);
    setShowProjectNameSuggestions(false);
  };

  // 문서 생성
  const handleDocumentGeneration = async () => {
    if (status !== 'authenticated') {
      const shouldContinue = confirm(
        '문서를 저장하려면 로그인이 필요합니다. 로그인 없이 계속하시겠습니까? (로컬에만 저장됩니다)'
      );
      if (!shouldContinue) {
        return;
      }
    }

    setIsGeneratingDocument(true);

    try {
      let response: Response;
      try {
        response = await fetch('/api/document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            questionAnswers,
          }),
        });
      } catch {
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }

      if (!response.ok) {
        let errorData: unknown = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          // JSON 파싱 실패 시 상세 정보 로깅 (개발 환경)
          if (process.env.NODE_ENV === 'development') {
            console.error('JSON 파싱 실패:', {
              status: response.status,
              statusText: response.statusText,
              parseError: parseError instanceof Error ? parseError.message : String(parseError),
            });
          }
          throw new Error(`서버 응답을 처리할 수 없습니다. (상태 코드: ${response.status})`);
        }
        const errorMessage = 
          (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'object' && errorData.error !== null && 'error' in errorData.error && typeof errorData.error.error === 'string' && errorData.error.error)
          || (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'string' && errorData.error)
          || '문서 생성에 실패했습니다.';
        throw new Error(errorMessage);
      }

      let result: unknown;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('서버 응답이 비어있습니다.');
        }
        result = JSON.parse(text);
      } catch {
        // JSON 파싱 실패 시 상세 정보 로깅 (개발 환경)
        if (process.env.NODE_ENV === 'development') {
          console.error('JSON 파싱 실패');
        }
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }

      // 타입 가드
      if (typeof result !== 'object' || result === null || !('success' in result)) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      if (!result.success) {
        const errorResult = result as { success: false; error: unknown };
        const errorMessage = 
          (typeof errorResult.error === 'object' && errorResult.error !== null && 'error' in errorResult.error && typeof (errorResult.error as { error: unknown }).error === 'string' && (errorResult.error as { error: string }).error)
          || (typeof errorResult.error === 'string' && errorResult.error)
          || '알 수 없는 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }

      const successResult = result as { success: true; data: DocumentGenerationResponse };
      setDocumentPreview(successResult.data);
    } catch (error) {
      console.error('문서 생성 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '문서 생성에 실패했습니다.';
      setErrorModal({
        isOpen: true,
        error: errorMessage,
        retryAction: () => {
          setErrorModal({ isOpen: false, error: '' });
          handleDocumentGeneration();
        },
      });
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  // 새로 시작
  const handleNewSession = () => {
    clearSessionFromStorage();
    setQuestionAnswers([]);
    setCurrentQuestion(INITIAL_QUESTION);
    setIsComplete(false);
    setDocumentPreview(null);
    setShowProjectNameSuggestions(false);
    setShowLoginChat(false);
    setShowHistory(false);
    setShowTrash(false);
    setSessionId(crypto.randomUUID());
  };

  // 기록에서 세션 선택
  const handleSelectSession = (session: ChatSessionStorage) => {
    setSessionId(session.sessionId);
    setQuestionAnswers(session.questionAnswers);
    setCurrentQuestion(session.currentQuestion || INITIAL_QUESTION);
    setIsComplete(session.isCompleted);
    setProjectDescription(session.projectDescription || '');
    setDocumentPreview(null);
    setShowProjectNameSuggestions(false);
    setShowHistory(false);
    setShowTrash(false);
    
    // 현재 세션으로 저장
    saveSessionToStorage({
      ...session,
      updatedAt: new Date(),
    });
  };

  // 로그인 채팅 완료 처리
  const handleLoginComplete = async () => {
    // Google OAuth 로그인
    await signIn('google', { callbackUrl: '/' });
    setShowLoginChat(false);
  };

  // 닉네임 설정 완료 처리
  const handleNicknameComplete = () => {
    setShowNicknameSetup(false);
    // 세션 새로고침하여 닉네임 반영
    window.location.reload();
  };

  // 로그인 후 닉네임 확인
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // 닉네임이 없으면 설정 화면 표시
      if (!session.user.name && !showNicknameSetup && !showLoginChat) {
        setShowNicknameSetup(true);
      }
    }
  }, [status, session, showNicknameSetup, showLoginChat]);

  if (status === 'loading') {
    return (
      <Layout>
        <Box display="flex" alignItems="center" justifyContent="center" minH="100vh">
          <Spinner size="lg" />
        </Box>
      </Layout>
    );
  }

  // 닉네임 설정 모드
  if (showNicknameSetup) {
    return (
      <Layout>
          <Flex w="full" h="full" gap={6} p={6}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={handleOpenLogin}
              onViewHistory={handleOpenHistory}
              onViewTrash={handleOpenTrash}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Card variant="floating" flex={1} h="full" overflow="hidden">
              <CardBody p={0} h="full" display="flex" flexDirection="column">
              <NicknameSetup
                onComplete={handleNicknameComplete}
                onCancel={() => setShowNicknameSetup(false)}
                currentNickname={session?.user?.name || null}
              />
              </CardBody>
            </Card>
          </Flex>
      </Layout>
    );
  }

  // 기록 보기 모드
  if (showHistory) {
    return (
      <Layout>
          <Flex w="full" h="full" gap={6} p={6}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={handleOpenLogin}
              onViewHistory={handleOpenHistory}
              onViewTrash={handleOpenTrash}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Card variant="floating" flex={1} h="full" overflow="hidden">
              <CardBody p={0} h="full" display="flex" flexDirection="column">
              <ChatHistoryList
                onSelectSession={handleSelectSession}
                onBack={() => setShowHistory(false)}
              />
              </CardBody>
            </Card>
          </Flex>
      </Layout>
    );
  }

  // 휴지통 모드
  if (showTrash) {
    return (
      <Layout>
          <Flex w="full" h="full" gap={6} p={6}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={handleOpenLogin}
              onViewHistory={handleOpenHistory}
              onViewTrash={handleOpenTrash}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Card variant="floating" flex={1} h="full" overflow="hidden">
              <CardBody p={0} h="full" display="flex" flexDirection="column">
              <TrashBinList onBack={() => setShowTrash(false)} />
              </CardBody>
            </Card>
          </Flex>
      </Layout>
    );
  }



  // 문서 프리뷰 모드
  if (documentPreview) {
    return (
      <Layout>
          <Flex w="full" h="full" gap={6} p={6}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={handleOpenLogin}
              onViewHistory={handleOpenHistory}
              onViewTrash={handleOpenTrash}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Card variant="floating" flex={1} h="full" overflow="hidden">
              <CardBody p={0} h="full" display="flex" flexDirection="column">
              <Box
                as="header"
                py={5}
                px={6}
                borderBottom="2px solid"
                borderColor="gray.200"
                bg="white"
                flexShrink={0}
                boxShadow="sm"
              >
                <Flex justify="flex-start" align="center">
                  <Logo size="md" />
                </Flex>
              </Box>
              
              <Box flex={1} overflowY="auto" px={4} py={6} bg="white">
                <DocumentPreview
                  title={documentPreview.title}
                  markdown={documentPreview.markdown}
                  documentId={documentPreview.documentId}
                  onDownload={() => {}}
                />
              </Box>
              </CardBody>
            </Card>
          </Flex>
      </Layout>
    );
  }

  // 프로젝트 이름 추천 모드
  if (showProjectNameSuggestions) {
    return (
      <Layout>
          <Flex w="full" h="full" gap={6} p={6}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={handleOpenLogin}
              onViewHistory={handleOpenHistory}
              onViewTrash={handleOpenTrash}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Card variant="floating" flex={1} h="full" overflow="hidden">
              <CardBody p={0} h="full" display="flex" flexDirection="column">
              <Box
                as="header"
                py={5}
                px={6}
                borderBottom="2px solid"
                borderColor="gray.200"
                bg="white"
                flexShrink={0}
                boxShadow="sm"
              >
                <Flex justify="flex-start" align="center">
                  <Logo size="md" />
                </Flex>
              </Box>
              
              <Box flex={1} overflowY="auto" px={4} py={6} bg="white">
                <ProjectNameSuggestions
                  suggestions={projectNameSuggestions}
                  isLoading={isLoadingSuggestions}
                  onSelect={handleProjectNameSelect}
                  onNext={handleNextSuggestions}
                  onCustomInput={handleProjectNameSelect}
                />
              </Box>
              </CardBody>
            </Card>
          </Flex>
      </Layout>
    );
  }

  // 채팅 모드
  return (
    <>
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, error: '' })}
        onRetry={errorModal.retryAction}
        error={errorModal.error}
        title="오류 발생"
      />
      <LoginModal
        isOpen={showLoginChat}
        onClose={() => setShowLoginChat(false)}
        onComplete={handleLoginComplete}
      />
      <Layout>
        <Flex w="full" h="full" gap={6} p={6} suppressHydrationWarning>
          <Sidebar
            onNewChat={handleNewSession}
            onLogin={handleOpenLogin}
            onViewHistory={handleOpenHistory}
            onViewTrash={handleOpenTrash}
            isAuthenticated={status === 'authenticated'}
            userEmail={session?.user?.email}
            userNickname={session?.user?.name || null}
          />
          <Card variant="floating" flex={1} h="full" overflow="hidden">
            <CardBody p={0} h="full" display="flex" flexDirection="column">
          {/* 헤더 */}
          <Box
            as="header"
            py={5}
            px={6}
            borderBottom="2px solid"
            borderColor="gray.200"
            bg="white"
            flexShrink={0}
            boxShadow="sm"
          >
            <Flex justify="space-between" align="center">
              <Logo size="md" />
              <ApiKeyDisplay />
            </Flex>
          </Box>

          {/* 채팅 영역 */}
          <ChatContainer
            questionAnswers={questionAnswers}
            currentQuestion={currentQuestion}
            isLoading={isLoading || isGeneratingDocument}
          />

          {/* 입력창 */}
          <ChatInput
            onSubmit={handleAnswerSubmit}
            isLoading={isLoading || isGeneratingDocument}
            placeholder={isComplete ? '문서 생성을 시작하려면 Enter를 누르세요' : '답변을 입력하세요...'}
            isComplete={isComplete}
          />
            </CardBody>
          </Card>
        </Flex>
    </Layout>
    </>
  );
}

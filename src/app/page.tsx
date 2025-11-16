/**
 * 메인 챗봇 페이지
 * 메신저 스타일 채팅 인터페이스
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  VStack,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import Layout from '@/components/Layout';
import Logo from '@/components/Logo';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ProjectNameSuggestions from '@/components/ProjectNameSuggestions';
import DocumentPreview from '@/components/DocumentPreview';
import LoginChat from '@/components/LoginChat';
import NicknameSetup from '@/components/NicknameSetup';
import Sidebar from '@/components/Sidebar';
import ChatHistoryList from '@/components/ChatHistoryList';
import ErrorModal from '@/components/ErrorModal';
import { signIn } from 'next-auth/react';
import {
  saveSessionToStorage,
  clearSessionFromStorage,
  type ChatSessionStorage,
} from '@/lib/storage';
import type { QuestionAnswer, ProjectNameSuggestion } from '@/types/chat';
import type { DocumentGenerationResponse } from '@/types/chat';

const INITIAL_QUESTION = '무엇을 만들어보고 싶으신가요?';

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
  const [showNicknameSetup, setShowNicknameSetup] = useState(false);
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
          // 네트워크 에러는 조용히 무시 (로컬 스토리지는 유지)
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // 네트워크 연결 실패는 조용히 무시
            return;
          }
          console.error('DB 세션 저장 실패:', error);
        });
      }
    }
  }, [sessionId, questionAnswers, currentQuestion, isComplete, projectDescription, status, session]);

  // 다음 질문 생성
  const handleAnswerSubmit = async (answer: string) => {
    if (isComplete) {
      await handleDocumentGeneration();
      return;
    }

    setIsLoading(true);

    try {
      if (questionAnswers.length === 0) {
        setProjectDescription(answer);
      }

      const newQA: QuestionAnswer = {
        id: crypto.randomUUID(),
        question: currentQuestion,
        answer,
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
            currentAnswer: answer,
          }),
        });
      } catch (fetchError) {
        // 네트워크 에러 (서버 연결 실패, 타임아웃 등)
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // API 응답 형식: { success: false, error: { error: string, code: string } } 또는 { success: false, error: string }
        const errorMessage = 
          (typeof errorData?.error === 'object' && errorData?.error?.error) 
          || (typeof errorData?.error === 'string' && errorData?.error)
          || '다음 질문 생성에 실패했습니다.';
        throw new Error(errorMessage);
      }

      const result = await response.json().catch((parseError) => {
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      });

      if (!result.success) {
        // API 응답 형식: { success: false, error: { error: string, code: string } } 또는 { success: false, error: string }
        const errorMessage = 
          (typeof result?.error === 'object' && result?.error?.error)
          || (typeof result?.error === 'string' && result?.error)
          || '알 수 없는 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }

      setCurrentQuestion(result.data.question);
      setIsComplete(result.data.isComplete);
      setSessionId(result.data.sessionId);

      if (result.data.question.toLowerCase().includes('프로젝트 이름') || 
          result.data.question.toLowerCase().includes('이름')) {
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
            handleAnswerSubmit(answer);
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
      } catch (fetchError) {
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = 
          (typeof errorData?.error === 'object' && errorData?.error?.error)
          || (typeof errorData?.error === 'string' && errorData?.error)
          || '프로젝트 이름 추천에 실패했습니다.';
        throw new Error(errorMessage);
      }

      const result = await response.json().catch((parseError) => {
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      });

      if (!result.success) {
        const errorMessage = 
          (typeof result?.error === 'object' && result?.error?.error)
          || (typeof result?.error === 'string' && result?.error)
          || '알 수 없는 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }

      setProjectNameSuggestions(result.data.suggestions);
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
      } catch (fetchError) {
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = 
          (typeof errorData?.error === 'object' && errorData?.error?.error)
          || (typeof errorData?.error === 'string' && errorData?.error)
          || '문서 생성에 실패했습니다.';
        throw new Error(errorMessage);
      }

      const result = await response.json().catch((parseError) => {
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      });

      if (!result.success) {
        const errorMessage = 
          (typeof result?.error === 'object' && result?.error?.error)
          || (typeof result?.error === 'string' && result?.error)
          || '알 수 없는 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }

      setDocumentPreview(result.data);
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
        <Box
          w="full"
          h="100vh"
          bg="gray.100"
          position="relative"
        >
          <Flex w="full" h="full" gap={4} p={4}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={() => setShowLoginChat(true)}
              onViewHistory={() => setShowHistory(true)}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Box
              flex={1}
              h="calc(100vh - 32px)"
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              boxShadow="lg"
              my={4}
            >
              <NicknameSetup
                onComplete={handleNicknameComplete}
                onCancel={() => setShowNicknameSetup(false)}
                currentNickname={session?.user?.name || null}
              />
            </Box>
          </Flex>
        </Box>
      </Layout>
    );
  }

  // 기록 보기 모드
  if (showHistory) {
    return (
      <Layout>
        <Box
          w="full"
          h="100vh"
          bg="gray.100"
          position="relative"
        >
          <Flex w="full" h="full" gap={4} p={4}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={() => setShowLoginChat(true)}
              onViewHistory={() => setShowHistory(true)}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Box
              flex={1}
              h="calc(100vh - 32px)"
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              boxShadow="lg"
              my={4}
            >
              <ChatHistoryList
                onSelectSession={handleSelectSession}
                onBack={() => setShowHistory(false)}
              />
            </Box>
          </Flex>
        </Box>
      </Layout>
    );
  }

  // 로그인 채팅 모드
  if (showLoginChat) {
    return (
      <Layout>
        <Box
          w="full"
          h="100vh"
          bg="gray.100"
          position="relative"
        >
          <Flex w="full" h="full" gap={4} p={4}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={() => setShowLoginChat(true)}
              onViewHistory={() => setShowHistory(true)}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <Box
              flex={1}
              h="calc(100vh - 32px)"
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              boxShadow="lg"
              my={4}
            >
              <LoginChat
                onComplete={handleLoginComplete}
                onCancel={() => setShowLoginChat(false)}
              />
            </Box>
          </Flex>
        </Box>
      </Layout>
    );
  }

  // 문서 프리뷰 모드
  if (documentPreview) {
    return (
      <Layout>
        <Box
          w="full"
          h="100vh"
          bg="gray.100"
          position="relative"
        >
          <Flex w="full" h="full" gap={4} p={4}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={() => setShowLoginChat(true)}
              onViewHistory={() => setShowHistory(true)}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <VStack
              align="stretch"
              spacing={0}
              flex={1}
              h="calc(100vh - 32px)"
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              boxShadow="lg"
              my={4}
            >
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
            </VStack>
          </Flex>
        </Box>
      </Layout>
    );
  }

  // 프로젝트 이름 추천 모드
  if (showProjectNameSuggestions) {
    return (
      <Layout>
        <Box
          w="full"
          h="100vh"
          bg="gray.100"
          position="relative"
        >
          <Flex w="full" h="full" gap={4} p={4}>
            <Sidebar
              onNewChat={handleNewSession}
              onLogin={() => setShowLoginChat(true)}
              onViewHistory={() => setShowHistory(true)}
              onEditNickname={() => setShowNicknameSetup(true)}
              isAuthenticated={status === 'authenticated'}
              userEmail={session?.user?.email}
              userNickname={session?.user?.name || null}
            />
            <VStack
              align="stretch"
              spacing={0}
              flex={1}
              h="calc(100vh - 32px)"
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              boxShadow="lg"
              my={4}
            >
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
            </VStack>
          </Flex>
        </Box>
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
      <Layout>
        <Box
        w="full"
        h="100vh"
        bg="gray.100"
        position="relative"
      >
        <Flex w="full" h="full" gap={4} p={4}>
          <Sidebar
            onNewChat={handleNewSession}
            onLogin={() => setShowLoginChat(true)}
            onViewHistory={() => setShowHistory(true)}
            isAuthenticated={status === 'authenticated'}
            userEmail={session?.user?.email}
          />
          <Flex
            direction="column"
            h="calc(100vh - 32px)"
            flex={1}
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
            boxShadow="lg"
            my={4}
          >
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
            <Flex justify="flex-start" align="center">
              <Logo size="md" />
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
        </Flex>
        </Flex>
      </Box>
    </Layout>
    </>
  );
}

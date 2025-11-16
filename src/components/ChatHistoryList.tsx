/**
 * 채팅 기록 목록 컴포넌트
 */

'use client';

import {
  Box,
  VStack,
  Text,
  Button,
  Flex,
  HStack,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { memo, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { ChatSessionStorage } from '@/lib/storage';
import { getSessionList, deleteSession } from '@/lib/storage';
import type { ChatSessionDTO } from '@/services/ChatSessionService';

interface ChatHistoryListProps {
  onSelectSession: (session: ChatSessionStorage) => void;
  onBack: () => void;
}

const ChatHistoryList = memo(function ChatHistoryList({
  onSelectSession,
  onBack,
}: ChatHistoryListProps) {
  const { status } = useSession();
  const [sessions, setSessions] = useState<ChatSessionStorage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // 로컬 스토리지에서 세션 불러오기
      const localSessions = getSessionList().sessions;
      
      // DB에서 세션 불러오기 (로그인한 경우)
      let dbSessions: ChatSessionDTO[] = [];
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/chat-sessions');
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              dbSessions = result.data;
            }
          }
        } catch (error) {
          console.error('DB 세션 불러오기 실패:', error);
        }
      }
      
      // DB 세션을 로컬 스토리지 형식으로 변환
      const dbSessionsFormatted: ChatSessionStorage[] = dbSessions.map((dbSession) => ({
        sessionId: dbSession.sessionId,
        questionAnswers: dbSession.questionAnswers.map((qa) => ({
          id: qa.id,
          question: qa.question,
          answer: qa.answer,
          order: qa.order,
          createdAt: qa.createdAt instanceof Date ? qa.createdAt : new Date(qa.createdAt || Date.now()),
          updatedAt: qa.updatedAt instanceof Date ? qa.updatedAt : new Date(qa.updatedAt || Date.now()),
        })),
        currentQuestion: dbSession.currentQuestion,
        isCompleted: dbSession.isCompleted,
        projectDescription: dbSession.projectDescription,
        createdAt: dbSession.createdAt instanceof Date ? dbSession.createdAt : new Date(dbSession.createdAt),
        updatedAt: dbSession.updatedAt instanceof Date ? dbSession.updatedAt : new Date(dbSession.updatedAt),
        title: dbSession.title,
      }));
      
      // 로컬 스토리지와 DB 세션 병합 (중복 제거)
      const sessionMap = new Map<string, ChatSessionStorage>();
      
      // 로컬 스토리지 세션 추가
      localSessions.forEach((session) => {
        sessionMap.set(session.sessionId, session);
      });
      
      // DB 세션 추가 (더 최신 데이터 우선)
      dbSessionsFormatted.forEach((session) => {
        const existing = sessionMap.get(session.sessionId);
        if (!existing || new Date(session.updatedAt) > new Date(existing.updatedAt)) {
          sessionMap.set(session.sessionId, session);
        }
      });
      
      // 최신순으로 정렬
      const mergedSessions = Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setSessions(mergedSessions);
    } catch (error) {
      console.error('세션 불러오기 실패:', error);
      // 실패 시 로컬 스토리지만 사용
      const localSessions = getSessionList().sessions;
      setSessions(localSessions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 채팅 기록을 삭제하시겠습니까?')) {
      // 로컬 스토리지에서 삭제
      deleteSession(sessionId);
      
      // DB에서 삭제 (로그인한 경우)
      if (status === 'authenticated') {
        try {
          await fetch(`/api/chat-sessions/${sessionId}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('DB 세션 삭제 실패:', error);
        }
      }
      
      loadSessions();
    }
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Box w="full" h="100vh" bg="white">
      {/* 헤더 */}
      <Flex
        justify="space-between"
        align="center"
        px={6}
        py={5}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
      >
        <HStack spacing={3}>
          <IconButton
            aria-label="뒤로가기"
            icon={<ArrowBackIcon />}
            size="sm"
            variant="ghost"
            onClick={onBack}
          />
          <Text fontSize="lg" fontWeight="600" color="gray.900">
            채팅 기록
          </Text>
        </HStack>
      </Flex>

      {/* 기록 목록 */}
      <Box
        flex={1}
        overflowY="auto"
        px={4}
        py={4}
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
        {isLoading ? (
          <VStack spacing={4} py={12} align="center">
            <Spinner size="lg" color="brand.500" />
            <Text fontSize="sm" color="gray.500">
              채팅 기록을 불러오는 중...
            </Text>
          </VStack>
        ) : sessions.length === 0 ? (
          <VStack spacing={4} py={12} align="center">
            <Text fontSize="md" color="gray.500">
              저장된 채팅 기록이 없습니다.
            </Text>
            <Button
              size="sm"
              variant="outline"
              onClick={onBack}
            >
              돌아가기
            </Button>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={2}>
            {sessions.map((session) => (
              <Box
                key={session.sessionId}
                p={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                cursor="pointer"
                _hover={{
                  bg: 'gray.50',
                  borderColor: 'gray.300',
                }}
                onClick={() => onSelectSession(session)}
              >
                <Flex justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                      color="gray.900"
                      noOfLines={1}
                    >
                      {session.title || '새 채팅'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {session.questionAnswers.length}개의 질문 · {formatDate(session.updatedAt)}
                    </Text>
                  </VStack>
                  <IconButton
                    aria-label="삭제"
                    icon={<DeleteIcon />}
                    size="xs"
                    variant="ghost"
                    color="gray.400"
                    onClick={(e) => handleDelete(session.sessionId, e)}
                    _hover={{ color: 'red.500' }}
                  />
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
});

export default ChatHistoryList;


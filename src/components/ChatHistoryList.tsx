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
} from '@chakra-ui/react';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { memo, useState, useEffect } from 'react';
import type { ChatSessionStorage } from '@/lib/storage';
import { getSessionList, deleteSession, loadSessionById } from '@/lib/storage';

interface ChatHistoryListProps {
  onSelectSession: (session: ChatSessionStorage) => void;
  onBack: () => void;
}

const ChatHistoryList = memo(function ChatHistoryList({
  onSelectSession,
  onBack,
}: ChatHistoryListProps) {
  const [sessions, setSessions] = useState<ChatSessionStorage[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const sessionList = getSessionList();
    setSessions(sessionList.sessions);
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 채팅 기록을 삭제하시겠습니까?')) {
      deleteSession(sessionId);
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
        {sessions.length === 0 ? (
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


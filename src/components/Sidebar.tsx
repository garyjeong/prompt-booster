/**
 * 사이드바 컴포넌트 (최소화, 리사이즈 가능)
 */

'use client';

import {
  Box,
  VStack,
  Button,
  Text,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  onNewChat: () => void;
  onLogin: () => void;
  onViewHistory: () => void;
  onEditNickname?: () => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  userNickname?: string | null;
}

const SIDEBAR_WIDTH_STORAGE_KEY = 'prompt-booster-sidebar-width';
const MIN_WIDTH = 180;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 240;

export default function Sidebar({
  onNewChat,
  onLogin,
  onViewHistory,
  onEditNickname,
  isAuthenticated,
  userEmail,
  userNickname,
}: SidebarProps) {
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          return parsed;
        }
      }
    }
    return DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  useEffect(() => {
    // 너비 변경 시 localStorage에 저장
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, width.toString());
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!sidebarRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };

    // 리사이즈 시작 시 전역 스타일 설정
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'auto';

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };
  }, [isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sidebarRef.current) {
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      setIsResizing(true);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (!isResizing) {
      setIsHovering(false);
    }
  };

  return (
    <Box
      ref={sidebarRef}
      position="relative"
      h="calc(100vh - 32px)"
      w={`${width}px`}
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      flexShrink={0}
      boxShadow="lg"
      my={4}
    >
      <VStack align="stretch" spacing={0} h="full" p={4}>
        {/* 최상단: 로그인 섹션 */}
        <Box mb={4}>
          {!isAuthenticated ? (
            <Button
              w="full"
              variant="solid"
              colorScheme="blue"
              onClick={onLogin}
              fontWeight="600"
              size="md"
              _hover={{ bg: 'blue.600' }}
            >
              로그인
            </Button>
          ) : (
            <VStack align="stretch" spacing={2}>
              <Box
                px={3}
                py={2}
                bg="blue.50"
                borderRadius="md"
                border="1px solid"
                borderColor="blue.200"
              >
                <HStack justify="space-between" align="flex-start">
                  <Box flex={1}>
                    <Text fontSize="xs" color="blue.600" mb={1} fontWeight="600">
                      로그인됨
                    </Text>
                    {userNickname ? (
                      <Text fontSize="sm" color="blue.800" fontWeight="600" noOfLines={1}>
                        {userNickname}
                      </Text>
                    ) : (
                      <Text fontSize="xs" color="blue.700" fontWeight="500" noOfLines={1}>
                        {userEmail}
                      </Text>
                    )}
                  </Box>
                </HStack>
              </Box>
              <HStack spacing={2}>
                {onEditNickname && (
                  <Button
                    flex={1}
                    size="xs"
                    variant="outline"
                    colorScheme="blue"
                    onClick={onEditNickname}
                    fontSize="xs"
                  >
                    닉네임 수정
                  </Button>
                )}
                <Button
                  flex={1}
                  size="xs"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  fontSize="xs"
                >
                  로그아웃
                </Button>
              </HStack>
            </VStack>
          )}
        </Box>

        <Divider my={3} borderColor="gray.300" />

        {/* 새 채팅과 기록 보기 섹션 */}
        <VStack align="stretch" spacing={2}>
          {/* 새 채팅 */}
          <Button
            w="full"
            justifyContent="flex-start"
            variant="ghost"
            onClick={onNewChat}
            color="gray.700"
            fontWeight="500"
            size="sm"
            _hover={{ bg: 'gray.100' }}
            px={2}
            py={2}
          >
            새 채팅
          </Button>

          {/* 기록 보기 */}
          <Button
            w="full"
            justifyContent="flex-start"
            variant="ghost"
            onClick={onViewHistory}
            color="gray.700"
            fontWeight="500"
            size="sm"
            _hover={{ bg: 'gray.100' }}
            px={2}
            py={2}
          >
            기록 보기
          </Button>
        </VStack>
      </VStack>

      {/* 리사이즈 핸들 */}
      <Box
        ref={resizeHandleRef}
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        w="10px"
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        zIndex={10}
        pointerEvents="auto"
        sx={{
          cursor: 'col-resize !important',
          '&:hover': {
            cursor: 'col-resize !important',
          },
        }}
      >
        {/* 리사이즈 핸들 시각적 표시 */}
        <Box
          position="absolute"
          right="0"
          top="0"
          bottom="0"
          w="4px"
          bg={
            isResizing
              ? 'blue.500'
              : isHovering
              ? 'blue.400'
              : 'transparent'
          }
          transition="background-color 0.15s"
          _hover={{
            bg: 'blue.400',
          }}
          sx={{
            cursor: 'col-resize !important',
          }}
        >
          {/* 중앙 인디케이터 */}
          <Box
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            w="2px"
            h="32px"
            bg={isResizing || isHovering ? 'white' : 'transparent'}
            borderRadius="1px"
            transition="background-color 0.15s"
          />
        </Box>
      </Box>
    </Box>
  );
}


/**
 * 사이드바 컴포넌트 (최소화, 리사이즈 가능)
 * Glassmorphism & Floating Design
 */

'use client';

import {
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    HStack,
    Icon,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { FiClock, FiEdit2, FiLogIn, FiLogOut, FiPlus, FiTrash2, FiUser } from 'react-icons/fi';

interface SidebarProps {
  onNewChat: () => void;
  onLogin: () => void;
  onViewHistory: () => void;
  onViewTrash: () => void;
  onEditNickname?: () => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  userNickname?: string | null;
}

const SIDEBAR_WIDTH_STORAGE_KEY = 'prompt-booster-sidebar-width';
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 260;

export default function Sidebar({
  onNewChat,
  onLogin,
  onViewHistory,
  onViewTrash,
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
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Colors
  const borderColor = useColorModeValue('whiteAlpha.400', 'whiteAlpha.200');
  const handleColor = useColorModeValue('brand.500', 'brand.400');
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  useEffect(() => {
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

  return (
    <Card
      ref={sidebarRef}
      variant="floating"
      h="full"
      w={`${width}px`}
      minW={`${width}px`}
      position="relative"
      flexShrink={0}
      transition={isResizing ? 'none' : 'width 0.2s ease'}
      overflow="hidden"
    >
      <CardBody p={0} h="full" display="flex" flexDirection="column">
        <VStack align="stretch" spacing={0} h="full" px={4} py={6}>
          {/* 최상단: 로그인 섹션 */}
          <Box mb={6}>
            {!isAuthenticated ? (
              <Button
                w="full"
                variant="solid"
                size="lg"
                onClick={onLogin}
                leftIcon={<Icon as={FiLogIn} />}
              >
                로그인
              </Button>
            ) : (
              <VStack align="stretch" spacing={3}>
                <Box
                  p={4}
                  bg={activeBg}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <HStack justify="space-between" align="center" mb={2}>
                    <Text fontSize="xs" color="brand.500" fontWeight="700" letterSpacing="wider">
                      LOGGED IN
                    </Text>
                    <Icon as={FiUser} color="brand.500" />
                  </HStack>
                  {userNickname ? (
                    <Text fontSize="md" fontWeight="bold" color={textColor} noOfLines={1}>
                      {userNickname}
                    </Text>
                  ) : (
                    <Text fontSize="sm" fontWeight="medium" color={textColor} noOfLines={1}>
                      {userEmail}
                    </Text>
                  )}
                </Box>
                <HStack spacing={2}>
                  {onEditNickname && (
                    <Button
                      flex={1}
                      size="sm"
                      variant="outline"
                      onClick={onEditNickname}
                      leftIcon={<Icon as={FiEdit2} />}
                      fontSize="xs"
                    >
                      닉네임
                    </Button>
                  )}
                  <Button
                    flex={1}
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    leftIcon={<Icon as={FiLogOut} />}
                    fontSize="xs"
                    _hover={{ bg: 'red.50', borderColor: 'red.200', color: 'red.600' }}
                  >
                    로그아웃
                  </Button>
                </HStack>
              </VStack>
            )}
          </Box>

          <Divider borderColor={borderColor} mb={6} />

          {/* 메뉴 섹션 */}
          <VStack align="stretch" spacing={2} flex={1}>
            <Button
              w="full"
              justifyContent="flex-start"
              variant="ghost"
              onClick={onNewChat}
              leftIcon={<Icon as={FiPlus} />}
              size="lg"
            >
              새 채팅
            </Button>

            <Button
              w="full"
              justifyContent="flex-start"
              variant="ghost"
              onClick={onViewHistory}
              leftIcon={<Icon as={FiClock} />}
              size="lg"
            >
              기록 보기
            </Button>

            <Button
              w="full"
              justifyContent="flex-start"
              variant="ghost"
              onClick={onViewTrash}
              leftIcon={<Icon as={FiTrash2} />}
              size="lg"
            >
              휴지통
            </Button>
          </VStack>
        </VStack>

        {/* 리사이즈 핸들 */}
        <Box
          position="absolute"
          right={0}
          top={0}
          bottom={0}
          w="12px"
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => !isResizing && setIsHovering(false)}
          zIndex={10}
          cursor="col-resize"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{
            '& > div': { bg: handleColor, opacity: 1, height: '40px' }
          }}
        >
          <Box
            w="4px"
            h={isResizing ? '40px' : '24px'}
            bg={isResizing ? handleColor : 'gray.300'}
            borderRadius="full"
            opacity={isResizing || isHovering ? 1 : 0}
            transition="all 0.2s"
          />
        </Box>
      </CardBody>
    </Card>
  );
}


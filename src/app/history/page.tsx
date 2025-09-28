/**
 * 프롬프트 히스토리 페이지
 */

'use client';

import React from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

// HistoryViewer를 Dynamic Import로 최적화
const HistoryViewer = dynamic(() => import('@/components/HistoryViewer'), {
  loading: () => <p>히스토리를 불러오는 중...</p>,
  ssr: false, // 클라이언트 사이드에서만 로드
});
import ColorModeToggle from '@/components/ColorModeToggle';
import { PromptProvider } from '@/context/PromptContext';

export default function HistoryPage() {
  const router = useRouter();
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <PromptProvider>
      <Layout>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            {/* 헤더 */}
            <HStack justify="space-between" align={{ base: 'stretch', md: 'center' }} flexWrap="wrap" spacing={{ base: 3, md: 4 }}>
              <VStack align="start" spacing={2}>
                <Heading size="lg" color={headingColor}>
                  프롬프트 히스토리
                </Heading>
                <Text color={textColor} fontSize="md">
                  과거에 개선했던 프롬프트들을 확인하고 재사용할 수 있습니다.
                </Text>
              </VStack>
              
              <HStack spacing={3} justify={{ base: 'flex-start', md: 'flex-end' }}>
                <ColorModeToggle size="sm" variant="outline" />
                <Button
                  leftIcon={<ArrowBackIcon />}
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  메인으로
                </Button>
              </HStack>
            </HStack>

            {/* 히스토리 뷰어 */}
            <HistoryViewer />
          </VStack>
        </Container>
      </Layout>
    </PromptProvider>
  );
}

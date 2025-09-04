import React, { memo } from 'react';
import { Box, Container, Flex, Text, Stack } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { AdContainer, AdSenseScript } from './ads';
import { AdPosition } from '@/types/ads';

interface LayoutProps {
  children: ReactNode;
  /** 광고 표시 여부 (기본값: true) */
  showAds?: boolean;
  /** 테스트 모드 여부 (기본값: process.env.NODE_ENV !== 'production') */
  testMode?: boolean;
}

const Layout = memo(function Layout({ 
  children, 
  showAds = true,
  testMode = process.env.NODE_ENV !== 'production'
}: LayoutProps) {
  return (
    <>
      {/* AdSense 스크립트 로드 */}
      {showAds && (
        <AdSenseScript
          clientId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""}
          testMode={testMode}
        />
      )}

      <Flex direction="column" minHeight="100vh">
        {/* Header */}
        <Box as="header" bg="blue.500" color="white" py={{ base: 3, md: 4 }}>
          <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
            <Text 
              fontSize={{ base: "xl", md: "2xl" }} 
              fontWeight="bold"
              lineHeight="shorter"
            >
              Prompt Booster
            </Text>
            <Text 
              fontSize={{ base: "xs", md: "sm" }} 
              opacity={0.9}
              mt={{ base: 1, md: 0 }}
            >
              AI 코딩 도우미를 위한 프롬프트 개선 도구
            </Text>
          </Container>
        </Box>

        {/* 상단 광고 (선택적) */}
        {showAds && (
          <Box bg="gray.50" py={2}>
            <Container maxW="container.xl">
              <AdContainer 
                position={AdPosition.TOP}
                testMode={testMode}
              />
            </Container>
          </Box>
        )}

        {/* Main Content with Sidebar */}
        <Box as="main" flex="1" py={{ base: 4, md: 6, lg: 8 }}>
          <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
            <Stack 
              direction={{ base: "column", lg: "row" }}
              align="start" 
              spacing={{ base: 6, lg: 8 }}
            >
              {/* Main Content Area */}
              <Box flex="1" w="full">
                {children}
              </Box>

              {/* Sidebar with Ads (데스크톱만) */}
              {showAds && (
                <Box 
                  display={{ base: "none", lg: "block" }} 
                  flexShrink={0}
                  w={{ lg: "300px" }}
                >
                  <AdContainer 
                    position={AdPosition.SIDEBAR}
                    testMode={testMode}
                  />
                </Box>
              )}
            </Stack>
          </Container>
        </Box>

        {/* 하단 광고 */}
        {showAds && (
          <Box bg="gray.50" py={4} borderTop="1px" borderColor="gray.200">
            <Container maxW="container.xl">
              <AdContainer 
                position={AdPosition.BOTTOM}
                testMode={testMode}
              />
            </Container>
          </Box>
        )}

        {/* Footer */}
        <Box as="footer" bg="gray.100" py={{ base: 3, md: 4 }} borderTop="1px" borderColor="gray.200">
          <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
            <Text 
              fontSize={{ base: "xs", md: "sm" }} 
              color="gray.600" 
              textAlign="center"
              lineHeight="relaxed"
            >
              © 2025 Prompt Booster. AI로 더 나은 프롬프트를 만들어보세요.
            </Text>
            {showAds && testMode && (
              <Text 
                fontSize="xs" 
                color="orange.500" 
                textAlign="center" 
                mt={{ base: 1, md: 1 }}
              >
                테스트 모드: 실제 광고 대신 플레이스홀더가 표시됩니다.
              </Text>
            )}
          </Container>
        </Box>
      </Flex>
    </>
  );
});

export default Layout;

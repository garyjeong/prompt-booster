import React, { memo } from 'react';
import { Box, Container, Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  return (
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

      {/* Main Content */}
      <Box as="main" flex="1" py={{ base: 4, md: 6, lg: 8 }}>
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          {children}
        </Container>
      </Box>

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
        </Container>
      </Box>
    </Flex>
  );
});

export default Layout;
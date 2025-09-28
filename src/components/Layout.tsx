import { Box, Flex, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { memo, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Flex direction="column" minHeight="100vh" bg="transparent">
      {/* Minimal Header */}
      <Box 
        as="header" 
        py={4}
        borderBottom="1px" 
        borderColor={borderColor}
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(24, 24, 27, 0.8)')}
        backdropFilter="blur(10px)"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Box maxW="4xl" mx="auto" px={6}>
          <VStack spacing={0} align="center">
            <Text 
              fontSize={{ base: "2xl", md: "3xl" }} 
              fontWeight="extrabold"
              bgGradient="linear(to-r, brand.500, brand.600)"
              bgClip="text"
              letterSpacing="-0.03em"
            >
              Prompt Booster
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Main Content - Centered Chat Layout */}
      <Box as="main" flex="1" py={8}>
        <Box maxW="4xl" mx="auto" px={6}>
          {children}
        </Box>
      </Box>

      {/* Minimal Footer */}
      <Box 
        as="footer" 
        py={6} 
        borderTop="1px" 
        borderColor={borderColor}
      >
        <Box maxW="4xl" mx="auto" px={6}>
          <Text 
            fontSize="xs" 
            color={subtextColor} 
            textAlign="center"
            fontWeight="medium"
          >
            Powered by AI • Made with ❤️ for developers
          </Text>
        </Box>
      </Box>
    </Flex>
  );
});

export default Layout;
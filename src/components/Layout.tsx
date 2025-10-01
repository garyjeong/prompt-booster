import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { memo, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex direction="column" minHeight="100vh" bg={bg} overflow="hidden">
      <Box as="main" flex="1" py={8} px={{ base: 4, md: 8 }}>
        <Box maxW="6xl" mx="auto" h="full">
          {children}
        </Box>
      </Box>
    </Flex>
  );
});

export default Layout;
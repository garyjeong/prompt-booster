import { Box, Flex } from '@chakra-ui/react';
import { memo, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  return (
    <Flex 
      direction="column" 
      minHeight="100vh" 
      bg="gray.50"
      p={4}
    >
      <Box 
        as="main" 
        flex="1" 
        w="full"
        maxW="4xl"
        mx="auto"
        h="full"
      >
        {children}
      </Box>
    </Flex>
  );
});

export default Layout;
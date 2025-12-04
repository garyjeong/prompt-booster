import { Box, Flex } from '@chakra-ui/react';
import { ReactNode, memo } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  return (
    <Flex 
      direction="column" 
      h="100vh"
      bg="transparent"
      p={0}
      suppressHydrationWarning
    >
      <Box 
        as="main" 
        flex="1" 
        w="full"
        maxW="100%"
        mx="auto"
        h="full"
        overflow="hidden"
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Flex>
  );
});

export default Layout;
/**
 * 마크다운 뷰어 컴포넌트
 * 미니멀 스타일
 */

'use client';

import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { memo } from 'react';

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = memo(function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <Box
      as="article"
      color="gray.800"
      lineHeight="1.8"
      sx={{
        '& h1': {
          fontSize: '2xl',
          fontWeight: '600',
          mt: 8,
          mb: 4,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          color: 'gray.900',
        },
        '& h2': {
          fontSize: 'xl',
          fontWeight: '600',
          mt: 6,
          mb: 3,
          color: 'gray.900',
        },
        '& h3': {
          fontSize: 'lg',
          fontWeight: '600',
          mt: 5,
          mb: 2,
          color: 'gray.900',
        },
        '& p': {
          mb: 4,
          lineHeight: '1.8',
        },
        '& ul, & ol': {
          mb: 4,
          pl: 6,
        },
        '& li': {
          mb: 2,
        },
        '& code': {
          bg: 'gray.100',
          px: 1.5,
          py: 0.5,
          borderRadius: 'sm',
          fontSize: 'sm',
          fontFamily: 'mono',
          color: 'gray.800',
        },
        '& pre': {
          bg: 'gray.50',
          p: 4,
          borderRadius: 'lg',
          overflowX: 'auto',
          mb: 4,
          border: '1px solid',
          borderColor: 'gray.200',
          '& code': {
            bg: 'transparent',
            p: 0,
          },
        },
        '& blockquote': {
          borderLeft: '3px solid',
          borderColor: 'brand.500',
          pl: 4,
          ml: 0,
          fontStyle: 'italic',
          color: 'gray.600',
          mb: 4,
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          mb: 4,
          '& th, & td': {
            border: '1px solid',
            borderColor: 'gray.200',
            px: 3,
            py: 2,
          },
          '& th': {
            bg: 'gray.50',
            fontWeight: '600',
          },
        },
        '& a': {
          color: 'brand.500',
          textDecoration: 'underline',
        },
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  );
});

export default MarkdownViewer;

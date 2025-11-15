/**
 * 문서 프리뷰 컴포넌트
 * 미니멀 스타일
 */

'use client';

import {
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Box,
  Divider,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { memo } from 'react';
import MarkdownViewer from './MarkdownViewer';

interface DocumentPreviewProps {
  title: string;
  markdown: string;
  documentId?: string;
  isLoading?: boolean;
  onDownload: () => void;
}

const DocumentPreview = memo(function DocumentPreview({
  title,
  markdown,
  documentId,
  isLoading = false,
  onDownload,
}: DocumentPreviewProps) {
  const handleDownload = async () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (documentId) {
      try {
        await fetch(`/api/document/${documentId}/download`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('다운로드 이력 저장 실패:', error);
      }
    }

    onDownload();
  };

  if (isLoading) {
    return (
      <Box py={16} textAlign="center">
        <Spinner size="lg" thickness="2px" color="brand.500" />
        <Text fontSize="sm" color="gray.500" mt={4}>
          문서를 생성하고 있습니다...
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6} w="full">
      {/* 헤더 */}
      <Box>
        <HStack justify="space-between" align="start" mb={2}>
          <Text fontSize="2xl" fontWeight="600" color="gray.900">
            {title}
          </Text>
          <Button 
            colorScheme="brand" 
            onClick={handleDownload}
            leftIcon={<DownloadIcon />}
            size="md"
          >
            다운로드
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          문서가 생성되었습니다. 내용을 확인한 후 다운로드하세요.
        </Text>
      </Box>

      <Divider />

      {/* 마크다운 뷰어 */}
      <MarkdownViewer content={markdown} />
    </VStack>
  );
});

export default DocumentPreview;

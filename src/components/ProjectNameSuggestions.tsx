/**
 * 프로젝트 이름 추천 컴포넌트
 * 미니멀 스타일
 */

'use client';

import {
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Spinner,
  Box,
  Divider,
} from '@chakra-ui/react';
import { memo, useState } from 'react';
import type { ProjectNameSuggestion } from '@/types/chat';

interface ProjectNameSuggestionsProps {
  suggestions: ProjectNameSuggestion[];
  isLoading?: boolean;
  onSelect: (name: string) => void;
  onNext: () => void;
  onCustomInput: (name: string) => void;
}

const ProjectNameSuggestions = memo(function ProjectNameSuggestions({
  suggestions,
  isLoading = false,
  onSelect,
  onNext,
  onCustomInput,
}: ProjectNameSuggestionsProps) {
  const [customName, setCustomName] = useState('');

  if (isLoading) {
    return (
      <Box py={12} textAlign="center">
        <Spinner size="lg" thickness="2px" color="brand.500" />
        <Text fontSize="sm" color="gray.500" mt={4}>
          추천 이름을 생성하고 있습니다...
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6} w="full">
      <Text 
        fontSize="sm" 
        fontWeight="600" 
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        프로젝트 이름 추천
      </Text>

      {/* 추천 목록 */}
      <VStack align="stretch" spacing={3}>
        {suggestions.map((suggestion, index) => (
          <Box
            key={index}
            p={4}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: 'brand.500',
              bg: 'brand.50',
            }}
            onClick={() => onSelect(suggestion.name)}
          >
            <Text 
              fontWeight="600" 
              fontSize="md"
              color="gray.900"
              mb={1}
            >
              {suggestion.name}
            </Text>
            {suggestion.description && (
              <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                {suggestion.description}
              </Text>
            )}
          </Box>
        ))}
      </VStack>

      <Divider />

      {/* 다음 추천 보기 */}
      <Button 
        variant="outline" 
        onClick={onNext} 
        w="full"
      >
        다음 추천 보기
      </Button>

      <Divider />

      {/* 직접 입력 */}
      <VStack align="stretch" spacing={3}>
        <Text fontSize="sm" fontWeight="500" color="gray.600">
          또는 직접 입력
        </Text>
        <HStack spacing={2}>
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="프로젝트 이름을 입력하세요"
            flex={1}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customName.trim()) {
                onCustomInput(customName.trim());
                setCustomName('');
              }
            }}
          />
          <Button
            colorScheme="brand"
            onClick={() => {
              if (customName.trim()) {
                onCustomInput(customName.trim());
                setCustomName('');
              }
            }}
            isDisabled={!customName.trim()}
            px={6}
          >
            확인
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
});

export default ProjectNameSuggestions;

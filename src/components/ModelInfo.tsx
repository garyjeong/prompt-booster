"use client";

import React, { memo, useMemo } from "react";
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  VStack,
  Text,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import type { TargetModel } from "@/types/api";

interface ModelInfoProps {
  targetModel: TargetModel;
}

const ModelInfo = memo(function ModelInfo({ targetModel }: ModelInfoProps) {
  const headerBg = useColorModeValue("gray.50", "gray.800");
  const badgeColor = useColorModeValue("blue", "blue");

  const info = useMemo(() => {
    switch (targetModel) {
      case "gpt-5":
        return {
          name: "GPT 스타일",
          highlights: [
            "구조화된 명령어와 단계별 사고 (CoT)",
            '명확한 역할 정의 ("You are a ...")',
            "구체적 예시와 형식 가이드",
          ],
          tip: "명확한 스텝과 출력 형식을 요구하면 성능이 좋아집니다",
        };
      case "claude-4-sonnet":
      case "claude-4-opus":
        return {
          name: "Claude 스타일",
          highlights: [
            "풍부한 맥락 설명과 배경 제공",
            "안전성·윤리 기준 고려",
            "예의 바르고 사려 깊은 톤",
          ],
          tip: "의도와 제약사항을 자세히 적을수록 품질이 높아집니다",
        };
      case "gemini-2.5-pro":
        return {
          name: "Gemini 스타일",
          highlights: [
            "코드·기술 맥락에 강점",
            "간결하고 정확한 지시 선호",
            "멀티모달 시나리오에 적합",
          ],
          tip: "핵심 요구사항을 간결히 정리하고 필수 조건을 명시하세요",
        };
      default:
        return {
          name: "모델 정보",
          highlights: ["선택한 모델에 맞춰 로컬 패턴으로 프롬프트를 개선합니다"],
          tip: "불필요한 맥락을 줄이고 목표를 분명히 하세요",
        };
    }
  }, [targetModel]);

  return (
    <Popover trigger="hover" placement="bottom-start">
      <PopoverTrigger>
        <IconButton
          aria-label="모델 정보"
          icon={<InfoOutlineIcon />}
          size="sm"
          variant="ghost"
          borderRadius="md"
        />
      </PopoverTrigger>
      <PopoverContent w="320px" _focus={{ boxShadow: "md" }}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader bg={headerBg} borderTopRadius="md">
          <HStack spacing={2}>
            <Badge colorScheme={badgeColor}>{info.name}</Badge>
            <Text fontSize="sm" color="gray.500">
              로컬 개선 모드
            </Text>
          </HStack>
        </PopoverHeader>
        <PopoverBody>
          <VStack align="stretch" spacing={2} fontSize="sm" color={useColorModeValue("gray.700", "gray.200")}> 
            {info.highlights.map((h, idx) => (
              <HStack key={idx} align="flex-start" spacing={2}>
                <Text as="span">•</Text>
                <Text as="span">{h}</Text>
              </HStack>
            ))}
            <Text mt={2} fontSize="xs" color={useColorModeValue("gray.600", "gray.400")}>💡 {info.tip}</Text>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

export default ModelInfo;



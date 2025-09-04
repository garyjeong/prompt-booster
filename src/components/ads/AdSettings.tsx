"use client";

import React from "react";
import {
	Box,
	Button,
	Switch,
	FormControl,
	FormLabel,
	HStack,
	VStack,
	Text,
	Badge,
	Stat,
	StatLabel,
	StatNumber,
	StatGroup,
	useColorModeValue,
	Divider,
} from "@chakra-ui/react";
import { useAds, useABTest, useAdPerformance } from "@/context/AdsContext";

interface AdSettingsProps {
	/** 개발 모드에서만 표시 여부 (기본값: true) */
	devOnly?: boolean;
}

/**
 * 광고 설정 관리 컴포넌트 (개발/테스트용)
 */
export default function AdSettings({ devOnly = true }: AdSettingsProps) {
	const {
		adsEnabled,
		testMode,
		toggleAds,
		toggleTestMode,
		resetAdData,
		isLoading,
	} = useAds();
	const { userGroup, abTestEnabled, switchUserGroup } = useABTest();
	const { adsShownToday, performanceData } = useAdPerformance();

	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	// 프로덕션에서 devOnly가 true이면 렌더링하지 않음
	if (devOnly && process.env.NODE_ENV === "production") {
		return null;
	}

	if (isLoading) {
		return (
			<Box p={4} bg={bgColor} border="1px" borderColor={borderColor} borderRadius="md">
				<Text>광고 설정 로딩 중...</Text>
			</Box>
		);
	}

	const totalImpressions = Object.values(performanceData).reduce(
		(sum, data) => sum + data.impressions,
		0
	);
	const totalClicks = Object.values(performanceData).reduce(
		(sum, data) => sum + data.clicks,
		0
	);
	const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

	return (
		<Box
			p={4}
			bg={bgColor}
			border="1px"
			borderColor={borderColor}
			borderRadius="md"
			shadow="sm"
		>
			<VStack spacing={4} align="stretch">
				<HStack justify="space-between">
					<Text fontSize="lg" fontWeight="semibold">
						광고 설정
					</Text>
					<Badge colorScheme={testMode ? "orange" : "green"}>
						{testMode ? "테스트 모드" : "실제 모드"}
					</Badge>
				</HStack>

				<Divider />

				{/* 기본 설정 */}
				<VStack spacing={3} align="stretch">
					<FormControl display="flex" alignItems="center">
						<FormLabel htmlFor="ads-enabled" mb="0" flex="1">
							광고 표시
						</FormLabel>
						<Switch
							id="ads-enabled"
							isChecked={adsEnabled}
							onChange={toggleAds}
							colorScheme="blue"
						/>
					</FormControl>

					<FormControl display="flex" alignItems="center">
						<FormLabel htmlFor="test-mode" mb="0" flex="1">
							테스트 모드
						</FormLabel>
						<Switch
							id="test-mode"
							isChecked={testMode}
							onChange={toggleTestMode}
							colorScheme="orange"
						/>
					</FormControl>
				</VStack>

				<Divider />

				{/* A/B 테스트 */}
				<VStack spacing={3} align="stretch">
					<Text fontSize="md" fontWeight="medium">
						A/B 테스트
					</Text>
					<HStack justify="space-between">
						<Text fontSize="sm">
							현재 그룹: <Badge colorScheme="purple">{userGroup.toUpperCase()}</Badge>
						</Text>
						<Button size="xs" onClick={switchUserGroup} disabled={!abTestEnabled}>
							그룹 변경
						</Button>
					</HStack>
				</VStack>

				<Divider />

				{/* 성능 통계 */}
				<VStack spacing={3} align="stretch">
					<Text fontSize="md" fontWeight="medium">
						오늘의 성과
					</Text>
					<StatGroup>
						<Stat size="sm">
							<StatLabel>노출 수</StatLabel>
							<StatNumber fontSize="lg">{totalImpressions}</StatNumber>
						</Stat>
						<Stat size="sm">
							<StatLabel>클릭 수</StatLabel>
							<StatNumber fontSize="lg">{totalClicks}</StatNumber>
						</Stat>
						<Stat size="sm">
							<StatLabel>CTR</StatLabel>
							<StatNumber fontSize="lg">{averageCTR.toFixed(2)}%</StatNumber>
						</Stat>
					</StatGroup>
					<Text fontSize="xs" color="gray.500">
						오늘 표시된 광고: {adsShownToday}개
					</Text>
				</VStack>

				<Divider />

				{/* 관리 버튼 */}
				<HStack spacing={2}>
					<Button size="sm" colorScheme="red" variant="outline" onClick={resetAdData}>
						데이터 초기화
					</Button>
				</HStack>

				{testMode && (
					<Box p={3} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
						<Text fontSize="xs" color="orange.700">
							<strong>테스트 모드:</strong> 실제 광고 대신 플레이스홀더가 표시됩니다.
							프로덕션에서는 자동으로 비활성화됩니다.
						</Text>
					</Box>
				)}
			</VStack>
		</Box>
	);
}

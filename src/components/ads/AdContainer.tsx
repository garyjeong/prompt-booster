"use client";

import React from "react";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import AdBanner from "./AdBanner";
import type { AdPosition, AdsSettings } from "@/types/ads";
import { getAdByPosition, DEFAULT_ADS_SETTINGS } from "@/lib/ads";

interface AdContainerProps {
	/** 광고 위치 */
	position: AdPosition;
	/** 광고 설정 (기본값: DEFAULT_ADS_SETTINGS) */
	settings?: AdsSettings;
	/** 테스트 모드 여부 */
	testMode?: boolean;
	/** 추가 스타일 */
	style?: React.CSSProperties;
	/** 추가 CSS 클래스 */
	className?: string;
}

/**
 * 위치별 광고 컨테이너 컴포넌트
 */
export default function AdContainer({
	position,
	settings = DEFAULT_ADS_SETTINGS,
	testMode = false,
	style,
	className,
}: AdContainerProps) {
	// 반응형 디스플레이 설정
	const displayValue = useBreakpointValue({
		base: position === "sidebar" ? "none" : "block", // 모바일에서는 사이드바 광고 숨김
		md: "block", // 태블릿 이상에서는 모든 광고 표시
	});

	// 해당 위치의 광고 설정 가져오기
	const adConfig = getAdByPosition(position, settings);

	// 표시할 광고가 없으면 렌더링하지 않음
	if (!adConfig) {
		return null;
	}

	// 광고 ID 생성 (위치 기반)
	const adId = `ad-${position}-${Date.now()}`;

	// 위치별 기본 스타일 설정
	const getPositionStyle = () => {
		switch (position) {
			case "top":
				return {
					width: "100%",
					textAlign: "center" as const,
					marginBottom: "1rem",
				};
			case "bottom":
				return {
					width: "100%",
					textAlign: "center" as const,
					marginTop: "2rem",
					marginBottom: "1rem",
				};
			case "sidebar":
				return {
					position: "sticky" as const,
					top: "2rem",
					width: "300px",
				};
			case "inline":
				return {
					width: "100%",
					margin: "1rem 0",
					textAlign: "center" as const,
				};
			case "floating":
				return {
					position: "fixed" as const,
					bottom: "1rem",
					right: "1rem",
					zIndex: 1000,
				};
			default:
				return {
					width: "100%",
					textAlign: "center" as const,
				};
		}
	};

	return (
		<Box
			display={displayValue}
			style={{
				...getPositionStyle(),
				...style,
			}}
			className={className}
		>
			<AdBanner
				config={adConfig}
				id={adId}
				testMode={testMode}
			/>
		</Box>
	);
}

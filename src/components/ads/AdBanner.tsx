"use client";

import React, { useEffect, useRef } from "react";
import { Box, Alert, AlertIcon, AlertDescription } from "@chakra-ui/react";
import type { AdConfig } from "@/types/ads";
import { recordAdImpression, recordAdClick } from "@/lib/ads";

interface AdBannerProps {
	/** 광고 설정 */
	config: AdConfig;
	/** 고유 식별자 */
	id: string;
	/** 추가 스타일 클래스 */
	className?: string;
	/** 테스트 모드 여부 */
	testMode?: boolean;
}

/**
 * Google AdSense 광고 배너 컴포넌트
 */
export default function AdBanner({
	config,
	id,
	className,
	testMode = false,
}: AdBannerProps) {
	const adRef = useRef<HTMLDivElement>(null);
	const isImpressionRecorded = useRef(false);

	useEffect(() => {
		// 테스트 모드에서는 실제 광고를 로드하지 않음
		if (testMode) {
			return;
		}

		// AdSense 스크립트가 로드되었는지 확인
		if (typeof window !== "undefined" && window.adsbygoogle) {
			try {
				// 광고 푸시
				(window.adsbygoogle = window.adsbygoogle || []).push({});
				
				// 노출 기록 (한 번만)
				if (!isImpressionRecorded.current) {
					recordAdImpression(id);
					isImpressionRecorded.current = true;
				}
			} catch (error) {
				console.error("AdSense 광고 로드 실패:", error);
			}
		}
	}, [id, testMode]);

	// 광고 클릭 핸들러
	const handleAdClick = () => {
		recordAdClick(id);
	};

	// 테스트 모드일 때 표시할 내용
	if (testMode) {
		return (
			<Box
				className={className}
				p={4}
				bg="gray.100"
				border="2px dashed gray.300"
				borderRadius="md"
				textAlign="center"
				minH={getAdHeight(config.size)}
			>
				<Alert status="info" size="sm">
					<AlertIcon />
					<AlertDescription fontSize="xs">
						테스트 모드: {config.position} 광고 ({config.size})
					</AlertDescription>
				</Alert>
			</Box>
		);
	}

	// 실제 AdSense 광고
	return (
		<Box
			className={className}
			ref={adRef}
			onClick={handleAdClick}
			minH={getAdHeight(config.size)}
			display="flex"
			alignItems="center"
			justifyContent="center"
		>
			<ins
				className="adsbygoogle"
				style={{
					display: config.size === "responsive" ? "block" : "inline-block",
					width: getAdWidth(config.size),
					height: getAdHeight(config.size),
				}}
				data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
				data-ad-slot={config.slotId}
				data-ad-format={config.size === "responsive" ? "auto" : undefined}
				data-full-width-responsive={
					config.size === "responsive" ? "true" : undefined
				}
			/>
		</Box>
	);
}

/**
 * 광고 크기에 따른 너비를 반환합니다.
 * @param size 광고 크기
 * @returns CSS 너비 값
 */
function getAdWidth(size: string): string {
	switch (size) {
		case "728x90":
			return "728px";
		case "468x60":
			return "468px";
		case "160x600":
			return "160px";
		case "300x250":
			return "300px";
		case "336x280":
			return "336px";
		case "responsive":
			return "100%";
		default:
			return "100%";
	}
}

/**
 * 광고 크기에 따른 높이를 반환합니다.
 * @param size 광고 크기
 * @returns CSS 높이 값
 */
function getAdHeight(size: string): string {
	switch (size) {
		case "728x90":
			return "90px";
		case "468x60":
			return "60px";
		case "160x600":
			return "600px";
		case "300x250":
			return "250px";
		case "336x280":
			return "280px";
		case "responsive":
			return "auto";
		default:
			return "250px";
	}
}

// AdSense 타입 선언 확장
declare global {
	interface Window {
		adsbygoogle: unknown[];
	}
}

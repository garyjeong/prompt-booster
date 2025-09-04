"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AdSenseScriptProps {
	/** AdSense 클라이언트 ID */
	clientId: string;
	/** 테스트 모드 여부 */
	testMode?: boolean;
}

/**
 * Google AdSense 스크립트를 로드하는 컴포넌트
 */
export default function AdSenseScript({
	clientId,
	testMode = false,
}: AdSenseScriptProps) {
	useEffect(() => {
		// 테스트 모드에서는 스크립트를 로드하지 않음
		if (testMode) {
			console.log("AdSense 테스트 모드: 스크립트 로드 건너뛰기");
			return;
		}

		// 클라이언트 ID가 없으면 경고
		if (!clientId) {
			console.warn(
				"AdSense 클라이언트 ID가 설정되지 않았습니다. 환경 변수 NEXT_PUBLIC_ADSENSE_CLIENT_ID를 확인하세요."
			);
			return;
		}

		// adsbygoogle 배열 초기화
		if (typeof window !== "undefined") {
			window.adsbygoogle = window.adsbygoogle || [];
		}
	}, [clientId, testMode]);

	// 테스트 모드에서는 스크립트를 렌더링하지 않음
	if (testMode || !clientId) {
		return null;
	}

	return (
		<Script
			async
			src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
			crossOrigin="anonymous"
			strategy="afterInteractive"
			onLoad={() => {
				console.log("AdSense 스크립트 로드 완료");
			}}
			onError={(error) => {
				console.error("AdSense 스크립트 로드 실패:", error);
			}}
		/>
	);
}

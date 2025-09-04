/**
 * 광고 관리 유틸리티 함수들
 */

import type {
	AdsSettings,
	AdStorageData,
	AdDisplayCondition,
	AdConfig,
	AdPosition,
	AdPerformanceData,
} from "@/types/ads";
import {
	DEFAULT_ADS_SETTINGS,
	ADS_STORAGE_KEY,
	getCurrentTimestamp,
	getTodayDateString,
	assignUserGroup,
} from "@/types/ads";

// Re-export for convenience
export { DEFAULT_ADS_SETTINGS };

/**
 * LocalStorage에서 광고 데이터를 가져옵니다.
 * @returns 광고 저장 데이터 또는 기본값
 */
export function getAdStorageData(): AdStorageData {
	try {
		if (typeof window === "undefined") {
			return createDefaultAdStorageData();
		}

		const stored = localStorage.getItem(ADS_STORAGE_KEY);
		if (!stored) {
			return createDefaultAdStorageData();
		}

		const parsed: AdStorageData = JSON.parse(stored);

		// 데이터 유효성 검사
		if (!parsed || typeof parsed !== "object") {
			return createDefaultAdStorageData();
		}

		// 날짜가 바뀌었으면 일일 카운터 리셋
		const today = getTodayDateString();
		const lastSavedDate = parsed.savedAt?.split("T")[0];

		if (lastSavedDate !== today) {
			return {
				...parsed,
				adsShownToday: 0,
				savedAt: getCurrentTimestamp(),
			};
		}

		return parsed;
	} catch (error) {
		console.error("광고 데이터 로드 실패:", error);
		return createDefaultAdStorageData();
	}
}

/**
 * 광고 데이터를 LocalStorage에 저장합니다.
 * @param data 저장할 광고 데이터
 */
export function setAdStorageData(data: Partial<AdStorageData>): void {
	try {
		if (typeof window === "undefined") {
			return;
		}

		const currentData = getAdStorageData();
		const updatedData: AdStorageData = {
			...currentData,
			...data,
			savedAt: getCurrentTimestamp(),
		};

		localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(updatedData));
	} catch (error) {
		console.error("광고 데이터 저장 실패:", error);
	}
}

/**
 * 기본 광고 저장 데이터를 생성합니다.
 * @returns 기본 광고 저장 데이터
 */
function createDefaultAdStorageData(): AdStorageData {
	return {
		userGroup: assignUserGroup(),
		adsShownToday: 0,
		lastAdShownAt: "",
		sessionStartTime: getCurrentTimestamp(),
		performanceData: {},
		savedAt: getCurrentTimestamp(),
	};
}

/**
 * 현재 광고 표시 조건을 가져옵니다.
 * @returns 광고 표시 조건
 */
export function getCurrentAdDisplayCondition(): AdDisplayCondition {
	const adData = getAdStorageData();

	return {
		screenWidth: typeof window !== "undefined" ? window.innerWidth : 1920,
		isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
		currentPath: typeof window !== "undefined" ? window.location.pathname : "/",
		sessionStartTime: new Date(adData.sessionStartTime).getTime(),
		adsShownToday: adData.adsShownToday,
		userGroup: adData.userGroup,
	};
}

/**
 * 특정 광고를 표시할 수 있는지 확인합니다.
 * @param adConfig 광고 설정
 * @param condition 표시 조건
 * @param settings 전체 광고 설정
 * @returns 표시 가능 여부
 */
export function canShowAd(
	adConfig: AdConfig,
	condition: AdDisplayCondition,
	settings: AdsSettings
): boolean {
	// 전체 광고가 비활성화된 경우
	if (!settings.enabled || !adConfig.enabled) {
		return false;
	}

	// 화면 크기 조건 확인
	if (condition.isMobile && !adConfig.showOnMobile) {
		return false;
	}
	if (!condition.isMobile && !adConfig.showOnDesktop) {
		return false;
	}

	// 최소/최대 화면 너비 확인
	if (
		adConfig.minScreenWidth &&
		condition.screenWidth < adConfig.minScreenWidth
	) {
		return false;
	}
	if (
		adConfig.maxScreenWidth &&
		condition.screenWidth > adConfig.maxScreenWidth
	) {
		return false;
	}

	// 일일 노출 한도 확인
	if (condition.adsShownToday >= settings.frequency.maxAdsPerDay) {
		return false;
	}

	// 표시 확률 확인
	if (Math.random() > adConfig.displayProbability) {
		return false;
	}

	// 최소 간격 확인 (마지막 광고 표시 후)
	const adData = getAdStorageData();
	if (adData.lastAdShownAt) {
		const lastShownTime = new Date(adData.lastAdShownAt).getTime();
		const currentTime = Date.now();
		const minInterval = settings.frequency.minIntervalBetweenAds * 1000; // 초를 밀리초로 변환

		if (currentTime - lastShownTime < minInterval) {
			return false;
		}
	}

	return true;
}

/**
 * 광고가 표시되었음을 기록합니다.
 * @param adId 광고 ID
 */
export function recordAdShown(adId: string): void {
	const adData = getAdStorageData();

	setAdStorageData({
		adsShownToday: adData.adsShownToday + 1,
		lastAdShownAt: getCurrentTimestamp(),
	});
}

/**
 * 광고 클릭을 기록합니다.
 * @param adId 광고 ID
 */
export function recordAdClick(adId: string): void {
	const adData = getAdStorageData();
	const performanceData =
		adData.performanceData[adId] || createDefaultPerformanceData(adId);

	const updatedPerformanceData = {
		...performanceData,
		clicks: performanceData.clicks + 1,
		ctr:
			(performanceData.clicks + 1) / Math.max(performanceData.impressions, 1),
		lastUpdated: getCurrentTimestamp(),
	};

	setAdStorageData({
		performanceData: {
			...adData.performanceData,
			[adId]: updatedPerformanceData,
		},
	});
}

/**
 * 광고 노출을 기록합니다.
 * @param adId 광고 ID
 */
export function recordAdImpression(adId: string): void {
	const adData = getAdStorageData();
	const performanceData =
		adData.performanceData[adId] || createDefaultPerformanceData(adId);

	const updatedPerformanceData = {
		...performanceData,
		impressions: performanceData.impressions + 1,
		ctr: performanceData.clicks / Math.max(performanceData.impressions + 1, 1),
		lastUpdated: getCurrentTimestamp(),
	};

	setAdStorageData({
		performanceData: {
			...adData.performanceData,
			[adId]: updatedPerformanceData,
		},
	});
}

/**
 * 기본 성능 데이터를 생성합니다.
 * @param adId 광고 ID
 * @returns 기본 성능 데이터
 */
function createDefaultPerformanceData(adId: string): AdPerformanceData {
	return {
		adId,
		impressions: 0,
		clicks: 0,
		ctr: 0,
		revenue: 0,
		lastUpdated: getCurrentTimestamp(),
	};
}

/**
 * A/B 테스트 그룹에 따른 광고 설정을 가져옵니다.
 * @param settings 전체 광고 설정
 * @param userGroup 사용자 그룹
 * @returns 필터링된 광고 설정
 */
export function getAdsForUserGroup(
	settings: AdsSettings,
	userGroup: "a" | "b"
): Record<string, AdConfig> {
	if (!settings.abTest.enabled) {
		return settings.ads;
	}

	const variant = settings.abTest.variants[userGroup];
	const filteredAds: Record<string, AdConfig> = {};

	// A/B 테스트 변형에 포함된 위치의 광고만 필터링
	Object.entries(settings.ads).forEach(([key, adConfig]) => {
		if (variant.positions.includes(adConfig.position)) {
			filteredAds[key] = {
				...adConfig,
				displayProbability: variant.displayProbability,
				...variant.config,
			};
		}
	});

	return filteredAds;
}

/**
 * 현재 표시 가능한 광고 목록을 가져옵니다.
 * @param settings 광고 설정 (기본값: DEFAULT_ADS_SETTINGS)
 * @returns 표시 가능한 광고 설정 목록
 */
export function getDisplayableAds(
	settings: AdsSettings = DEFAULT_ADS_SETTINGS
): Record<string, AdConfig> {
	const condition = getCurrentAdDisplayCondition();
	const adsForUser = getAdsForUserGroup(settings, condition.userGroup);
	const displayableAds: Record<string, AdConfig> = {};

	Object.entries(adsForUser).forEach(([key, adConfig]) => {
		if (canShowAd(adConfig, condition, settings)) {
			displayableAds[key] = adConfig;
		}
	});

	// 페이지당 최대 광고 수 제한
	const entries = Object.entries(displayableAds);
	if (entries.length > settings.frequency.maxAdsPerPage) {
		const limited = entries.slice(0, settings.frequency.maxAdsPerPage);
		return Object.fromEntries(limited);
	}

	return displayableAds;
}

/**
 * 특정 위치의 광고를 가져옵니다.
 * @param position 광고 위치
 * @param settings 광고 설정 (기본값: DEFAULT_ADS_SETTINGS)
 * @returns 해당 위치의 광고 설정 또는 null
 */
export function getAdByPosition(
	position: AdPosition,
	settings: AdsSettings = DEFAULT_ADS_SETTINGS
): AdConfig | null {
	const displayableAds = getDisplayableAds(settings);

	const adEntry = Object.entries(displayableAds).find(
		([, adConfig]) => adConfig.position === position
	);

	return adEntry ? adEntry[1] : null;
}

/**
 * 광고 데이터를 초기화합니다.
 */
export function clearAdData(): void {
	try {
		if (typeof window === "undefined") {
			return;
		}

		localStorage.removeItem(ADS_STORAGE_KEY);
	} catch (error) {
		console.error("광고 데이터 삭제 실패:", error);
	}
}

/**
 * 광고 성능 리포트를 가져옵니다.
 * @returns 광고 성능 데이터 목록
 */
export function getAdPerformanceReport(): AdPerformanceData[] {
	const adData = getAdStorageData();
	return Object.values(adData.performanceData);
}

/**
 * 광고 설정이 유효한지 확인합니다.
 * @param settings 확인할 광고 설정
 * @returns 유효성 여부
 */
export function validateAdsSettings(settings: AdsSettings): boolean {
	if (!settings.clientId) {
		console.warn("AdSense 클라이언트 ID가 설정되지 않았습니다.");
		return false;
	}

	if (Object.keys(settings.ads).length === 0) {
		console.warn("설정된 광고가 없습니다.");
		return false;
	}

	// 각 광고 설정 검증
	for (const [key, adConfig] of Object.entries(settings.ads)) {
		if (!adConfig.slotId) {
			console.warn(`광고 ${key}의 슬롯 ID가 설정되지 않았습니다.`);
			return false;
		}
	}

	return true;
}

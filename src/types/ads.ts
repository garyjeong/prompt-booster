/**
 * 광고 관리 관련 타입 정의
 */

/** 광고 위치 */
export enum AdPosition {
	/** 페이지 상단 */
	TOP = "top",
	/** 페이지 하단 */
	BOTTOM = "bottom",
	/** 사이드바 */
	SIDEBAR = "sidebar",
	/** 콘텐츠 내부 */
	INLINE = "inline",
	/** 플로팅 */
	FLOATING = "floating",
}

/** 광고 크기 */
export enum AdSize {
	/** 리더보드 (728x90) */
	LEADERBOARD = "728x90",
	/** 배너 (468x60) */
	BANNER = "468x60",
	/** 스카이스크래퍼 (160x600) */
	SKYSCRAPER = "160x600",
	/** 중간 직사각형 (300x250) */
	MEDIUM_RECTANGLE = "300x250",
	/** 대형 직사각형 (336x280) */
	LARGE_RECTANGLE = "336x280",
	/** 반응형 */
	RESPONSIVE = "responsive",
}

/** 광고 유형 */
export enum AdType {
	/** 디스플레이 광고 */
	DISPLAY = "display",
	/** 텍스트 광고 */
	TEXT = "text",
	/** 혼합 */
	TEXT_AND_DISPLAY = "text_and_display",
}

/** 단일 광고 설정 */
export interface AdConfig {
	/** 광고 슬롯 ID */
	slotId: string;
	/** 광고 위치 */
	position: AdPosition;
	/** 광고 크기 */
	size: AdSize;
	/** 광고 유형 */
	type: AdType;
	/** 표시 확률 (0-1) */
	displayProbability: number;
	/** 활성화 여부 */
	enabled: boolean;
	/** 모바일에서 표시 여부 */
	showOnMobile: boolean;
	/** 데스크톱에서 표시 여부 */
	showOnDesktop: boolean;
	/** 최소 화면 너비 (px) */
	minScreenWidth?: number;
	/** 최대 화면 너비 (px) */
	maxScreenWidth?: number;
}

/** 전체 광고 설정 */
export interface AdsSettings {
	/** AdSense 클라이언트 ID */
	clientId: string;
	/** 광고 활성화 여부 */
	enabled: boolean;
	/** 개발 모드 여부 */
	testMode: boolean;
	/** 광고 설정 목록 */
	ads: Record<string, AdConfig>;
	/** A/B 테스트 설정 */
	abTest: ABTestConfig;
	/** 광고 노출 제한 설정 */
	frequency: FrequencyConfig;
}

/** A/B 테스트 설정 */
export interface ABTestConfig {
	/** A/B 테스트 활성화 여부 */
	enabled: boolean;
	/** 사용자 그룹 분할 비율 (A그룹 비율, 0-1) */
	splitRatio: number;
	/** 현재 실행 중인 테스트 ID */
	activeTestId?: string;
	/** 테스트 변형 설정 */
	variants: {
		/** A 그룹 설정 */
		a: AdVariant;
		/** B 그룹 설정 */
		b: AdVariant;
	};
}

/** 광고 변형 설정 */
export interface AdVariant {
	/** 변형 이름 */
	name: string;
	/** 광고 위치 설정 */
	positions: AdPosition[];
	/** 표시 확률 */
	displayProbability: number;
	/** 추가 설정 */
	config?: Partial<AdConfig>;
}

/** 광고 노출 빈도 제어 */
export interface FrequencyConfig {
	/** 페이지 로드당 최대 광고 수 */
	maxAdsPerPage: number;
	/** 세션당 최대 광고 노출 수 */
	maxAdsPerSession: number;
	/** 광고 간 최소 간격 (초) */
	minIntervalBetweenAds: number;
	/** 사용자별 일일 최대 노출 수 */
	maxAdsPerDay: number;
}

/** 광고 표시 조건 */
export interface AdDisplayCondition {
	/** 화면 너비 */
	screenWidth: number;
	/** 모바일 여부 */
	isMobile: boolean;
	/** 현재 페이지 경로 */
	currentPath: string;
	/** 세션 시작 시간 */
	sessionStartTime: number;
	/** 오늘 표시된 광고 수 */
	adsShownToday: number;
	/** 사용자 그룹 (A/B 테스트) */
	userGroup: "a" | "b";
}

/** 광고 성능 트래킹 데이터 */
export interface AdPerformanceData {
	/** 광고 ID */
	adId: string;
	/** 노출 수 */
	impressions: number;
	/** 클릭 수 */
	clicks: number;
	/** 클릭률 */
	ctr: number;
	/** 수익 (예상) */
	revenue: number;
	/** 마지막 업데이트 시간 */
	lastUpdated: string;
}

/** LocalStorage 저장용 광고 데이터 */
export interface AdStorageData {
	/** 사용자 그룹 */
	userGroup: "a" | "b";
	/** 오늘 표시된 광고 수 */
	adsShownToday: number;
	/** 마지막 광고 표시 시간 */
	lastAdShownAt: string;
	/** 세션 시작 시간 */
	sessionStartTime: string;
	/** 광고 성능 데이터 */
	performanceData: Record<string, AdPerformanceData>;
	/** 설정 저장 시간 */
	savedAt: string;
}

/** 기본 광고 설정 */
export const DEFAULT_ADS_SETTINGS: AdsSettings = {
	clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
	enabled: true,
	testMode: process.env.NODE_ENV !== "production",
	ads: {
		bottomBanner: {
			slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || "",
			position: AdPosition.BOTTOM,
			size: AdSize.LEADERBOARD,
			type: AdType.DISPLAY,
			displayProbability: 0.9,
			enabled: true,
			showOnMobile: true,
			showOnDesktop: true,
			minScreenWidth: 320,
		},
		sidebarAd: {
			slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || "",
			position: AdPosition.SIDEBAR,
			size: AdSize.MEDIUM_RECTANGLE,
			type: AdType.DISPLAY,
			displayProbability: 0.7,
			enabled: true,
			showOnMobile: false,
			showOnDesktop: true,
			minScreenWidth: 1024,
		},
	},
	abTest: {
		enabled: false,
		splitRatio: 0.5,
		variants: {
			a: {
				name: "기본 광고 위치",
				positions: [AdPosition.BOTTOM],
				displayProbability: 0.9,
			},
			b: {
				name: "사이드바 포함",
				positions: [AdPosition.BOTTOM, AdPosition.SIDEBAR],
				displayProbability: 0.8,
			},
		},
	},
	frequency: {
		maxAdsPerPage: 2,
		maxAdsPerSession: 10,
		minIntervalBetweenAds: 30,
		maxAdsPerDay: 50,
	},
};

/** LocalStorage 키 상수 */
export const ADS_STORAGE_KEY = "prompt_booster_ads_data";

/** 현재 시간을 ISO 문자열로 반환 */
export function getCurrentTimestamp(): string {
	return new Date().toISOString();
}

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
export function getTodayDateString(): string {
	return new Date().toISOString().split("T")[0];
}

/** 사용자를 A/B 테스트 그룹으로 분할 */
export function assignUserGroup(splitRatio: number = 0.5): "a" | "b" {
	return Math.random() < splitRatio ? "a" : "b";
}

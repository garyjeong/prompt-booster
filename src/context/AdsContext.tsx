"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from "react";
import type {
	AdsSettings,
	AdStorageData,
	AdDisplayCondition,
} from "@/types/ads";
import {
	DEFAULT_ADS_SETTINGS,
} from "@/types/ads";
import {
	getAdStorageData,
	setAdStorageData,
	getCurrentAdDisplayCondition,
	validateAdsSettings,
	getAdPerformanceReport,
	clearAdData,
} from "@/lib/ads";

/** AdsContext 타입 */
interface AdsContextType {
	/** 현재 광고 설정 */
	settings: AdsSettings;
	/** 광고 저장 데이터 */
	adData: AdStorageData;
	/** 현재 표시 조건 */
	displayCondition: AdDisplayCondition;
	/** 로딩 상태 */
	isLoading: boolean;
	/** 광고 활성화 여부 */
	adsEnabled: boolean;
	/** 테스트 모드 여부 */
	testMode: boolean;
	/** 설정 업데이트 */
	updateSettings: (newSettings: Partial<AdsSettings>) => void;
	/** 광고 활성화/비활성화 토글 */
	toggleAds: () => void;
	/** 테스트 모드 토글 */
	toggleTestMode: () => void;
	/** A/B 테스트 그룹 변경 */
	switchUserGroup: () => void;
	/** 광고 데이터 초기화 */
	resetAdData: () => void;
	/** 성능 리포트 가져오기 */
	getPerformanceReport: () => void;
}

/** AdsContext 생성 */
const AdsContext = createContext<AdsContextType | undefined>(undefined);

/** AdsProvider Props */
interface AdsProviderProps {
	children: ReactNode;
	/** 초기 광고 설정 */
	initialSettings?: Partial<AdsSettings>;
}

/** AdsProvider 컴포넌트 */
export function AdsProvider({ children, initialSettings }: AdsProviderProps) {
	const [settings, setSettings] = useState<AdsSettings>({
		...DEFAULT_ADS_SETTINGS,
		...initialSettings,
	});
	const [adData, setAdData] = useState<AdStorageData>(getAdStorageData());
	const [displayCondition, setDisplayCondition] = useState<AdDisplayCondition>(
		getCurrentAdDisplayCondition()
	);
	const [isLoading, setIsLoading] = useState(true);

	// 초기 데이터 로드
	useEffect(() => {
		const loadData = async () => {
			try {
				const storageData = getAdStorageData();
				const condition = getCurrentAdDisplayCondition();

				setAdData(storageData);
				setDisplayCondition(condition);

				// 설정 유효성 검증
				if (!validateAdsSettings(settings)) {
					console.warn("광고 설정이 유효하지 않습니다.");
				}
			} catch (error) {
				console.error("광고 데이터 로드 실패:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [settings]);

	// 화면 크기 변경 감지
	useEffect(() => {
		const handleResize = () => {
			setDisplayCondition(getCurrentAdDisplayCondition());
		};

		if (typeof window !== "undefined") {
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}
	}, []);

	// 설정 업데이트
	const updateSettings = useCallback(
		(newSettings: Partial<AdsSettings>) => {
			setSettings((prev) => ({
				...prev,
				...newSettings,
			}));
		},
		[]
	);

	// 광고 활성화/비활성화 토글
	const toggleAds = useCallback(() => {
		setSettings((prev) => ({
			...prev,
			enabled: !prev.enabled,
		}));
	}, []);

	// 테스트 모드 토글
	const toggleTestMode = useCallback(() => {
		setSettings((prev) => ({
			...prev,
			testMode: !prev.testMode,
		}));
	}, []);

	// A/B 테스트 그룹 변경
	const switchUserGroup = useCallback(() => {
		const newGroup: "a" | "b" = adData.userGroup === "a" ? "b" : "a";
		const newAdData = { ...adData, userGroup: newGroup };
		
		setAdData(newAdData);
		setAdStorageData(newAdData);
		setDisplayCondition(getCurrentAdDisplayCondition());
	}, [adData]);

	// 광고 데이터 초기화
	const resetAdData = useCallback(() => {
		clearAdData();
		const newData = getAdStorageData();
		setAdData(newData);
		setDisplayCondition(getCurrentAdDisplayCondition());
	}, []);

	// 성능 리포트 가져오기
	const getPerformanceReport = useCallback(() => {
		return getAdPerformanceReport();
	}, []);

	// 파생 상태들
	const adsEnabled = settings.enabled;
	const testMode = settings.testMode;

	// Context value 구성
	const contextValue: AdsContextType = {
		settings,
		adData,
		displayCondition,
		isLoading,
		adsEnabled,
		testMode,
		updateSettings,
		toggleAds,
		toggleTestMode,
		switchUserGroup,
		resetAdData,
		getPerformanceReport,
	};

	return (
		<AdsContext.Provider value={contextValue}>
			{children}
		</AdsContext.Provider>
	);
}

/** AdsContext 사용 훅 */
export function useAds(): AdsContextType {
	const context = useContext(AdsContext);
	if (context === undefined) {
		throw new Error("useAds must be used within an AdsProvider");
	}
	return context;
}

/** 광고 설정만 사용하는 훅 */
export function useAdsSettings() {
	const { settings, updateSettings, adsEnabled, testMode } = useAds();
	return { settings, updateSettings, adsEnabled, testMode };
}

/** A/B 테스트 관련 기능만 사용하는 훅 */
export function useABTest() {
	const { adData, switchUserGroup, settings } = useAds();
	return {
		userGroup: adData.userGroup,
		abTestEnabled: settings.abTest.enabled,
		switchUserGroup,
	};
}

/** 광고 성능 관련 기능만 사용하는 훅 */
export function useAdPerformance() {
	const { adData, getPerformanceReport } = useAds();
	return {
		performanceData: adData.performanceData,
		adsShownToday: adData.adsShownToday,
		getPerformanceReport,
	};
}

/** 광고 표시 여부 확인 훅 */
export function useCanShowAds() {
	const { adsEnabled, testMode, isLoading } = useAds();
	return adsEnabled && !isLoading;
}

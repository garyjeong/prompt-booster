/**
 * 광고 관련 컴포넌트 exports
 */

export { default as AdBanner } from "./AdBanner";
export { default as AdSenseScript } from "./AdSenseScript";
export { default as AdContainer } from "./AdContainer";
export { default as AdSettings } from "./AdSettings";

// 편의를 위한 re-export
export type { AdConfig, AdPosition, AdsSettings } from "@/types/ads";
export {
	getAdByPosition,
	getDisplayableAds,
	DEFAULT_ADS_SETTINGS,
	recordAdShown,
	recordAdClick,
	recordAdImpression,
} from "@/lib/ads";

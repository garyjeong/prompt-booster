/**
 * Chakra UI 테마 설정
 * Starbucks Inspired Premium Green Palette
 * Glassmorphism & Floating Card Design
 */

"use client";

import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { type StyleFunctionProps } from "@chakra-ui/theme-tools";

// 다크모드 설정 (시스템 설정 따름)
const config: ThemeConfig = {
	initialColorMode: "system",
	useSystemColorMode: true,
};

// 스타벅스 영감 그린 팔레트 & 뉴트럴 톤
const colors = {
	brand: {
		50: "#e6f3f0",   // 매우 연한 민트
		100: "#cce4dd",  // 연한 세이지
		200: "#99c9bc",  // 부드러운 그린
		300: "#66ad9b",  // 중간 그린
		400: "#33927a",  // 밝은 스타벅스 그린
		500: "#00704a",  // 스타벅스 메인 그린 (Primary)
		600: "#006241",  // 딥 그린 (Hover)
		700: "#1e3932",  // 다크 포레스트 (Dark Mode Bg)
		800: "#132520",  // 매우 어두운 그린
		900: "#0b1b15",  // 거의 블랙에 가까운 그린
	},
	accent: {
		500: "#d4e9e2", // 스타벅스 라떼 아트 배경색 느낌
		600: "#cba258", // 골드 액센트 (스타 리워드 느낌)
	},
	gray: {
		50: "#f9f9f9",
		100: "#f2f0eb", // 웜 그레이 (종이 질감)
		200: "#e5e5e5",
		300: "#d4d4d4",
		400: "#a3a3a3",
		500: "#737373",
		600: "#525252",
		700: "#404040",
		800: "#262626",
		900: "#171717",
	},
};

// 프리미엄 컴포넌트 스타일
const components = {
	Button: {
		baseStyle: {
			fontWeight: "600",
			borderRadius: "full", // 둥근 알약 형태
			transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		},
		variants: {
			solid: (props: StyleFunctionProps) => ({
				bg: props.colorMode === "dark" ? "brand.500" : "brand.600",
				color: "white",
				_hover: {
					bg: props.colorMode === "dark" ? "brand.400" : "brand.700",
					transform: "translateY(-1px)",
					boxShadow: "lg",
				},
				_active: {
					bg: props.colorMode === "dark" ? "brand.600" : "brand.800",
					transform: "translateY(0)",
				},
			}),
			outline: (props: StyleFunctionProps) => ({
				borderColor: props.colorMode === "dark" ? "brand.400" : "brand.600",
				color: props.colorMode === "dark" ? "brand.400" : "brand.600",
				_hover: {
					bg: props.colorMode === "dark" ? "whiteAlpha.100" : "brand.50",
				},
			}),
			ghost: (props: StyleFunctionProps) => ({
				color: props.colorMode === "dark" ? "gray.300" : "gray.600",
				_hover: {
					bg: props.colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.50",
					color: props.colorMode === "dark" ? "white" : "brand.600",
				},
			}),
			glass: (props: StyleFunctionProps) => ({
				bg: props.colorMode === "dark" ? "whiteAlpha.100" : "whiteAlpha.500",
				backdropFilter: "blur(10px)",
				border: "1px solid",
				borderColor: props.colorMode === "dark" ? "whiteAlpha.200" : "whiteAlpha.300",
				color: props.colorMode === "dark" ? "white" : "gray.800",
				_hover: {
					bg: props.colorMode === "dark" ? "whiteAlpha.200" : "whiteAlpha.600",
				},
			}),
		},
	},
	Card: {
		baseStyle: (props: StyleFunctionProps) => ({
			container: {
				borderRadius: "2xl",
				bg: props.colorMode === "dark" ? "gray.800" : "white",
				boxShadow: props.colorMode === "dark" 
					? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.16)" 
					: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
				border: "1px solid",
				borderColor: props.colorMode === "dark" ? "whiteAlpha.100" : "gray.100",
			},
		}),
		variants: {
			floating: (props: StyleFunctionProps) => ({
				container: {
					bg: props.colorMode === "dark" ? "rgba(30, 57, 50, 0.7)" : "rgba(255, 255, 255, 0.8)",
					backdropFilter: "blur(16px)",
					border: "1px solid",
					borderColor: props.colorMode === "dark" ? "whiteAlpha.100" : "whiteAlpha.400",
					boxShadow: "xl",
				},
			}),
		},
	},
	Input: {
		variants: {
			filled: (props: StyleFunctionProps) => ({
				field: {
					bg: props.colorMode === "dark" ? "whiteAlpha.100" : "gray.50",
					borderRadius: "xl",
					border: "1px solid",
					borderColor: "transparent",
					_hover: {
						bg: props.colorMode === "dark" ? "whiteAlpha.200" : "gray.100",
					},
					_focus: {
						bg: props.colorMode === "dark" ? "whiteAlpha.200" : "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					},
				},
			}),
		},
		defaultProps: {
			variant: "filled",
		},
	},
};

// 폰트 설정
const fonts = {
	heading: `'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
	body: `'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
	mono: `'Geist Mono', 'SF Mono', monospace`,
};

// 전역 스타일
const styles = {
	global: (props: StyleFunctionProps) => ({
		body: {
			bg: props.colorMode === "dark" ? "brand.900" : "gray.100",
			color: props.colorMode === "dark" ? "gray.100" : "gray.800",
			// 배경 패턴 (옵션)
			backgroundImage: props.colorMode === "dark" 
				? "radial-gradient(circle at 50% 0%, #1e3932 0%, #0b1b15 70%)"
				: "radial-gradient(circle at 50% 0%, #d4e9e2 0%, #f2f0eb 70%)",
			backgroundAttachment: "fixed",
		},
		// 스크롤바 커스텀
		"::-webkit-scrollbar": {
			width: "8px",
			height: "8px",
		},
		"::-webkit-scrollbar-track": {
			bg: "transparent",
		},
		"::-webkit-scrollbar-thumb": {
			bg: props.colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.200",
			borderRadius: "full",
			_hover: {
				bg: props.colorMode === "dark" ? "whiteAlpha.300" : "blackAlpha.300",
			},
		},
	}),
};

const theme = extendTheme({
	config,
	colors,
	components,
	fonts,
	styles,
});

export default theme;

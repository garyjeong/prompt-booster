/**
 * Chakra UI 테마 설정
 * 다크모드 지원 및 커스텀 컬러 팔레트
 */

"use client";

import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// 다크모드 설정
const config: ThemeConfig = {
	initialColorMode: "system", // 시스템 설정을 따름
	useSystemColorMode: true, // 시스템 다크모드 자동 감지
};

// 모던하고 미니멀한 컬러 팔레트
const colors = {
	brand: {
		50: "#f0f9ff",
		100: "#e0f2fe",
		200: "#bae6fd",
		300: "#7dd3fc",
		400: "#38bdf8",
		500: "#0ea5e9", // 메인 브랜드 컬러 (모던 블루)
		600: "#0284c7",
		700: "#0369a1",
		800: "#075985",
		900: "#0c4a6e",
	},
	gray: {
		50: "#fafafa",
		100: "#f4f4f5",
		200: "#e4e4e7",
		300: "#d4d4d8",
		400: "#a1a1aa",
		500: "#71717a",
		600: "#52525b",
		700: "#3f3f46",
		800: "#27272a",
		900: "#18181b",
	},
	neutral: {
		50: "#fafafa",
		100: "#f5f5f5",
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

// 모던 컴포넌트 스타일 커스터마이징
const components = {
	Button: {
		defaultProps: {
			colorScheme: "brand",
		},
		variants: {
			solid: {
				bg: "brand.500",
				color: "white",
				border: "none",
				borderRadius: "xl",
				fontWeight: "medium",
				px: 6,
				_hover: {
					bg: "brand.600",
					transform: "translateY(-1px)",
					shadow: "lg",
				},
				_active: {
					transform: "translateY(0)",
				},
			},
			outline: {
				borderColor: "gray.200",
				borderRadius: "xl",
				fontWeight: "medium",
				px: 4,
				_hover: {
					bg: "gray.50",
					borderColor: "gray.300",
					transform: "translateY(-1px)",
					shadow: "sm",
				},
				_dark: {
					borderColor: "gray.600",
					_hover: {
						bg: "gray.700",
						borderColor: "gray.500",
					},
				},
			},
			ghost: {
				borderRadius: "xl",
				fontWeight: "medium",
				_hover: {
					bg: "gray.100",
					transform: "translateY(-1px)",
				},
				_dark: {
					_hover: {
						bg: "gray.700",
					},
				},
			},
		},
	},
	Card: {
		baseStyle: {
			container: {
				bg: "white",
				borderRadius: "2xl",
				border: "1px",
				borderColor: "gray.100",
				shadow: "sm",
				transition: "all 0.2s ease-in-out",
				_hover: {
					shadow: "md",
					transform: "translateY(-2px)",
				},
				_dark: {
					bg: "gray.800",
					borderColor: "gray.700",
				},
			},
		},
	},
	Input: {
		variants: {
			outline: {
				field: {
					borderRadius: "xl",
					border: "1px",
					borderColor: "gray.200",
					bg: "white",
					_focus: {
						borderColor: "brand.400",
						boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
						bg: "white",
					},
					_placeholder: {
						color: "gray.400",
					},
					_dark: {
						bg: "gray.700",
						borderColor: "gray.600",
						_focus: {
							bg: "gray.700",
							borderColor: "brand.400",
						},
					},
				},
			},
		},
	},
	Textarea: {
		variants: {
			outline: {
				borderRadius: "xl",
				border: "1px",
				borderColor: "gray.200",
				bg: "white",
				resize: "none",
				_focus: {
					borderColor: "brand.400",
					boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
					bg: "white",
				},
				_placeholder: {
					color: "gray.400",
				},
				_dark: {
					bg: "gray.700",
					borderColor: "gray.600",
					_focus: {
						bg: "gray.700",
						borderColor: "brand.400",
					},
				},
			},
		},
	},
};

// 폰트 설정
const fonts = {
	heading: `'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
	body: `'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
};

// 모던 전역 스타일
const styles = {
	global: (props: { colorMode: string }) => ({
		body: {
			bg: props.colorMode === "dark" ? "gray.900" : "white",
			color: props.colorMode === "dark" ? "gray.100" : "gray.800",
			lineHeight: "1.6",
			fontFeatureSettings: '"cv02","cv03","cv04","cv11"',
		},
		"*::placeholder": {
			color: props.colorMode === "dark" ? "gray.500" : "gray.400",
		},
		"*, *::before, &::after": {
			borderColor: props.colorMode === "dark" ? "gray.600" : "gray.200",
		},
		// 스크롤바 스타일링
		"::-webkit-scrollbar": {
			width: "6px",
		},
		"::-webkit-scrollbar-track": {
			bg: "transparent",
		},
		"::-webkit-scrollbar-thumb": {
			bg: props.colorMode === "dark" ? "gray.600" : "gray.300",
			borderRadius: "full",
		},
		"::-webkit-scrollbar-thumb:hover": {
			bg: props.colorMode === "dark" ? "gray.500" : "gray.400",
		},
	}),
};

// 반응형 브레이크포인트
const breakpoints = {
	base: "0em", // 0px
	sm: "30em", // ~480px
	md: "48em", // ~768px
	lg: "62em", // ~992px
	xl: "80em", // ~1280px
	"2xl": "96em", // ~1536px
};

// 테마 확장
const theme = extendTheme({
	config,
	colors,
	components,
	fonts,
	styles,
	breakpoints,
});

export default theme;

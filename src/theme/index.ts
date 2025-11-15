/**
 * Chakra UI 테마 설정
 * 고급스러운 색상 팔레트
 */

"use client";

import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// 다크모드 설정 (라이트 우선)
const config: ThemeConfig = {
	initialColorMode: "light",
	useSystemColorMode: false,
};

// 고급스러운 컬러 팔레트
const colors = {
	brand: {
		50: "#f0f4f8",   // 매우 연한 네이비
		100: "#d9e2ec",  // 연한 네이비
		200: "#bcccdc",  // 밝은 네이비
		300: "#9fb3c8",  // 중간 밝기 네이비
		400: "#829ab1",  // 네이비 그레이
		500: "#627d98",  // 메인 브랜드 컬러 (고급스러운 네이비)
		600: "#486581",  // 진한 네이비
		700: "#334e68",  // 더 진한 네이비
		800: "#243a52",  // 매우 진한 네이비
		900: "#102a43",  // 최대 진한 네이비
	},
	gray: {
		50: "#fafafa",   // 크림 화이트
		100: "#f5f5f5",  // 매우 연한 그레이
		200: "#e8e8e8",  // 연한 그레이 (부드러운 테두리)
		300: "#d4d4d4",  // 중간 연한 그레이 (구분선)
		400: "#9e9e9e",  // 중간 그레이 (비활성 텍스트)
		500: "#757575",  // 중간 그레이 (보조 텍스트)
		600: "#616161",  // 진한 그레이 (본문 텍스트)
		700: "#424242",  // 더 진한 그레이 (강조 텍스트)
		800: "#2d2d2d",  // 매우 진한 그레이 (제목)
		900: "#1a1a1a",  // 최대 진한 그레이 (최강조)
	},
};

// 고급스러운 컴포넌트 스타일
const components = {
	Button: {
		defaultProps: {
			colorScheme: "brand",
		},
		baseStyle: {
			fontWeight: "500",
			borderRadius: "lg",
		},
		variants: {
			solid: {
				bg: "brand.500",
				color: "white",
				border: "none",
				px: 6,
				py: 2.5,
				_hover: {
					bg: "brand.600",
				},
				_active: {
					bg: "brand.700",
				},
			},
			outline: {
				borderColor: "gray.300",
				borderWidth: "1px",
				color: "gray.700",
				bg: "transparent",
				px: 5,
				py: 2.5,
				_hover: {
					bg: "gray.50",
					borderColor: "gray.400",
				},
			},
			ghost: {
				color: "gray.600",
				bg: "transparent",
				px: 4,
				py: 2,
				_hover: {
					bg: "gray.100",
				},
			},
		},
	},
	Card: {
		baseStyle: {
			container: {
				bg: "white",
				borderRadius: "lg",
				border: "1px solid",
				borderColor: "gray.200",
				shadow: "none",
				transition: "all 0.2s ease",
			},
		},
		variants: {
			elevated: {
				container: {
					shadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
				},
			},
			flat: {
				container: {
					border: "none",
					shadow: "none",
					bg: "transparent",
				},
			},
		},
		defaultProps: {
			variant: "elevated",
		},
	},
	Input: {
		variants: {
			outline: {
				field: {
					borderRadius: "lg",
					border: "1px solid",
					borderColor: "gray.300",
					bg: "white",
					_focus: {
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					},
					_placeholder: {
						color: "gray.400",
					},
				},
			},
		},
	},
	Textarea: {
		variants: {
			outline: {
				borderRadius: "lg",
				border: "1px solid",
				borderColor: "gray.300",
				bg: "white",
				resize: "none",
				_focus: {
					borderColor: "brand.500",
					boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
				},
				_placeholder: {
					color: "gray.400",
				},
			},
		},
	},
};

// 폰트 설정
const fonts = {
	heading: `'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
	body: `'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
	mono: `'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace`,
};

// 타이포그래피 스케일 확장
const fontSizes = {
	xs: "0.75rem",    // 12px
	sm: "0.875rem",   // 14px
	md: "1rem",       // 16px
	lg: "1.125rem",   // 18px
	xl: "1.25rem",    // 20px
	"2xl": "1.5rem",  // 24px
	"3xl": "1.875rem", // 30px
	"4xl": "2.25rem",  // 36px
	"5xl": "3rem",     // 48px
	"6xl": "3.75rem",  // 60px
};

// 간격 시스템 정리
const space = {
	px: "1px",
	0: "0",
	0.5: "0.125rem",  // 2px
	1: "0.25rem",     // 4px
	1.5: "0.375rem",  // 6px
	2: "0.5rem",      // 8px
	2.5: "0.625rem",  // 10px
	3: "0.75rem",     // 12px
	3.5: "0.875rem",  // 14px
	4: "1rem",        // 16px
	5: "1.25rem",     // 20px
	6: "1.5rem",      // 24px
	7: "1.75rem",     // 28px
	8: "2rem",        // 32px
	9: "2.25rem",     // 36px
	10: "2.5rem",     // 40px
	12: "3rem",       // 48px
	14: "3.5rem",     // 56px
	16: "4rem",       // 64px
	20: "5rem",       // 80px
	24: "6rem",       // 96px
	28: "7rem",       // 112px
	32: "8rem",       // 128px
	36: "9rem",       // 144px
	40: "10rem",      // 160px
	44: "11rem",      // 176px
	48: "12rem",      // 192px
	52: "13rem",      // 208px
	56: "14rem",      // 224px
	60: "15rem",      // 240px
	64: "16rem",      // 256px
	72: "18rem",      // 288px
	80: "20rem",      // 320px
	96: "24rem",       // 384px
};

// 고급스러운 전역 스타일
const styles = {
    global: {
        body: {
            bg: "#fafafa",
            color: "gray.800",
            lineHeight: "1.6",
            fontFeatureSettings: '"cv02","cv03","cv04","cv11"',
        },
        "*::placeholder": {
            color: "gray.400",
        },
        // 스크롤바 스타일링 (고급스러운)
        "::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
        },
        "::-webkit-scrollbar-track": {
            bg: "transparent",
        },
        "::-webkit-scrollbar-thumb": {
            bg: "gray.300",
            borderRadius: "full",
            _hover: {
                bg: "gray.400",
            },
        },
    },
};

// 미니멀 트랜지션 설정
const transition = {
    property: {
        common: "background-color, border-color, color, opacity",
        colors: "background-color, border-color, color",
    },
    easing: {
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    duration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
    },
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
	fontSizes,
	space,
	styles,
	breakpoints,
	transition,
});

export default theme;

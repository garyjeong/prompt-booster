"use client";

import React, { useEffect, useRef, useCallback } from "react";
import {
	Button,
	ButtonProps,
	Tooltip,
	useColorModeValue,
} from "@chakra-ui/react";
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";
import { useClipboard } from "@/hooks/useClipboard";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
	/** 복사할 텍스트 */
	text: string;
	/** 버튼 텍스트 (기본값: 아이콘만 표시) */
	children?: React.ReactNode;
	/** 복사 완료 시 버튼 텍스트 */
	copiedText?: React.ReactNode;
	/** 툴팁 텍스트 */
	tooltip?: string;
	/** 복사 완료 시 툴팁 텍스트 */
	copiedTooltip?: string;
	/** 아이콘 표시 여부 */
	showIcon?: boolean;
	/** 아이콘 위치 */
	iconPosition?: "left" | "right";
	/** 복사 성공 토스트 제목 */
	successTitle?: string;
	/** 복사 성공 토스트 설명 */
	successDescription?: string;
	/** 복사 실패 토스트 제목 */
	errorTitle?: string;
	/** 복사 실패 토스트 설명 */
	errorDescription?: string;
	/** 토스트 표시 여부 */
	showToast?: boolean;
	/** 키보드 단축키 활성화 여부 (Ctrl/Cmd + C) */
	enableKeyboardShortcut?: boolean;
	/** 키보드 단축키 범위 제한 (해당 컴포넌트에 포커스되었을 때만) */
	shortcutScope?: "global" | "focused";
}

/**
 * 클립보드 복사 기능이 내장된 재사용 가능한 버튼 컴포넌트
 */
export default function CopyButton({
	text,
	children,
	copiedText,
	tooltip = "클립보드에 복사",
	copiedTooltip = "복사됨!",
	showIcon = true,
	iconPosition = "left",
	successTitle,
	successDescription,
	errorTitle,
	errorDescription,
	showToast = true,
	enableKeyboardShortcut = false,
	shortcutScope = "focused",
	...buttonProps
}: CopyButtonProps) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const { copy, isCopied, isLoading } = useClipboard({
		successTitle,
		successDescription,
		errorTitle,
		errorDescription,
		showToast,
	});

	const handleCopy = useCallback(() => {
		copy(text);
	}, [copy, text]);

	// 키보드 단축키 처리
	useEffect(() => {
		if (!enableKeyboardShortcut) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			// Ctrl+C (Windows) 또는 Cmd+C (Mac)
			if ((event.ctrlKey || event.metaKey) && event.key === "c") {
				// 범위 제한이 "focused"인 경우 버튼에 포커스가 있을 때만 실행
				if (shortcutScope === "focused") {
					if (document.activeElement === buttonRef.current) {
						event.preventDefault();
						handleCopy();
					}
				} else {
					// "global" 범위인 경우 다른 입력 요소에 포커스가 없을 때만 실행
					const activeElement = document.activeElement;
					const isInputFocused = 
						activeElement &&
						(activeElement.tagName === "INPUT" ||
						activeElement.tagName === "TEXTAREA" ||
						(activeElement as HTMLElement).contentEditable === "true");
					
					if (!isInputFocused) {
						event.preventDefault();
						handleCopy();
					}
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [enableKeyboardShortcut, shortcutScope, handleCopy]);

	// 버튼 색상 테마
	const copyIconColor = useColorModeValue("gray.500", "gray.400");
	const checkIconColor = useColorModeValue("green.500", "green.300");

	// 아이콘 컴포넌트
	const icon = isCopied ? (
		<CheckIcon color={checkIconColor} />
	) : (
		<CopyIcon color={copyIconColor} />
	);

	// 버튼 내용 구성
	const buttonContent = () => {
		const textContent = isCopied && copiedText ? copiedText : children;
		
		if (!showIcon && !textContent) {
			// 아이콘도 텍스트도 없으면 기본 아이콘 표시
			return icon;
		}

		if (!textContent) {
			// 텍스트가 없으면 아이콘만
			return showIcon ? icon : null;
		}

		if (!showIcon) {
			// 아이콘 없이 텍스트만
			return textContent;
		}

		// 아이콘과 텍스트 모두 표시
		return iconPosition === "left" ? (
			<>
				{icon}
				<span style={{ marginLeft: "8px" }}>{textContent}</span>
			</>
		) : (
			<>
				<span style={{ marginRight: "8px" }}>{textContent}</span>
				{icon}
			</>
		);
	};

	const button = (
		<Button
			ref={buttonRef}
			onClick={handleCopy}
			isDisabled={!text || text.trim() === "" || isCopied || isLoading}
			isLoading={isLoading}
			aria-label={isCopied ? copiedTooltip : tooltip}
			aria-describedby={enableKeyboardShortcut ? "copy-button-shortcut" : undefined}
			{...buttonProps}
		>
			{buttonContent()}
		</Button>
	);

	// 키보드 단축키 정보가 포함된 툴팁 텍스트
	const tooltipLabel = isCopied 
		? copiedTooltip 
		: enableKeyboardShortcut 
			? `${tooltip} (Ctrl+C)` 
			: tooltip;

	// 툴팁 있으면 툴팁으로 감싸기
	if (tooltip || copiedTooltip) {
		return (
			<>
				<Tooltip
					label={tooltipLabel}
					placement="top"
					hasArrow
				>
					{button}
				</Tooltip>
				{enableKeyboardShortcut && (
					<span 
						id="copy-button-shortcut" 
						style={{ display: "none" }}
						aria-hidden="true"
					>
						키보드 단축키: Ctrl+C (Windows) 또는 Cmd+C (Mac)
					</span>
				)}
			</>
		);
	}

	return (
		<>
			{button}
			{enableKeyboardShortcut && (
				<span 
					id="copy-button-shortcut" 
					style={{ display: "none" }}
					aria-hidden="true"
				>
					키보드 단축키: Ctrl+C (Windows) 또는 Cmd+C (Mac)
				</span>
			)}
		</>
	);
}

/** 사전 정의된 스타일 변형들 */
export const CopyButtonVariants = {
	/** 기본 스타일 */
	default: {
		colorScheme: "gray",
		variant: "outline",
		size: "sm",
	},
	/** 성공 스타일 */
	success: {
		colorScheme: "green",
		variant: "outline",
		size: "sm",
	},
	/** 미니멀 스타일 */
	minimal: {
		variant: "ghost",
		size: "sm",
		colorScheme: "gray",
	},
	/** 솔리드 스타일 */
	solid: {
		colorScheme: "blue",
		variant: "solid",
		size: "sm",
	},
} as const;

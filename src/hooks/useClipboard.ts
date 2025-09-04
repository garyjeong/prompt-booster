"use client";

import { useState, useCallback } from "react";
import { useToast } from "@chakra-ui/react";

/** useClipboard 훅의 반환 타입 */
interface UseClipboardReturn {
	/** 복사 함수 */
	copy: (text: string) => Promise<void>;
	/** 복사 완료 상태 */
	isCopied: boolean;
	/** 복사 진행 중 상태 */
	isLoading: boolean;
	/** 마지막 에러 */
	error: string | null;
	/** 에러 초기화 */
	clearError: () => void;
	/** 복사 상태 수동 리셋 */
	resetCopyState: () => void;
}

/** useClipboard 옵션 */
interface UseClipboardOptions {
	/** 복사 완료 토스트 제목 */
	successTitle?: string;
	/** 복사 완료 토스트 설명 */
	successDescription?: string;
	/** 복사 실패 토스트 제목 */
	errorTitle?: string;
	/** 복사 실패 토스트 설명 */
	errorDescription?: string;
	/** 복사 완료 후 상태 리셋 시간 (ms) */
	resetDelay?: number;
	/** 토스트 표시 시간 (ms) */
	toastDuration?: number;
	/** 토스트 자동 닫기 여부 */
	isToastClosable?: boolean;
	/** 자동 토스트 표시 여부 */
	showToast?: boolean;
}

/**
 * 클립보드 복사 기능을 제공하는 커스텀 훅
 * @param options 복사 옵션
 * @returns 복사 관련 함수 및 상태
 */
export function useClipboard(
	options: UseClipboardOptions = {}
): UseClipboardReturn {
	const {
		successTitle = "복사 완료!",
		successDescription = "클립보드에 복사되었습니다.",
		errorTitle = "복사 실패",
		errorDescription = "클립보드 복사에 실패했습니다.",
		resetDelay = 2000,
		toastDuration = 2000,
		isToastClosable = true,
		showToast = true,
	} = options;

	const [isCopied, setIsCopied] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const toast = useToast();

	/** 에러 초기화 */
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	/** 복사 상태 수동 리셋 */
	const resetCopyState = useCallback(() => {
		setIsCopied(false);
		setError(null);
	}, []);

	/** 복사 함수 */
	const copy = useCallback(
		async (text: string) => {
			// 빈 텍스트 체크
			if (!text || text.trim() === "") {
				const errorMsg = "복사할 텍스트가 없습니다.";
				setError(errorMsg);
				if (showToast) {
					toast({
						title: errorTitle,
						description: errorMsg,
						status: "error",
						duration: toastDuration,
						isClosable: isToastClosable,
					});
				}
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				// 클립보드 API 지원 확인
				if (!navigator.clipboard) {
					throw new Error("클립보드 API가 지원되지 않습니다.");
				}

				// 클립보드에 텍스트 복사
				await navigator.clipboard.writeText(text);

				setIsCopied(true);

				if (showToast) {
					toast({
						title: successTitle,
						description: successDescription,
						status: "success",
						duration: toastDuration,
						isClosable: isToastClosable,
					});
				}

				// 일정 시간 후 복사 상태 리셋
				setTimeout(() => {
					setIsCopied(false);
				}, resetDelay);
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : errorDescription;
				setError(errorMsg);

				if (showToast) {
					toast({
						title: errorTitle,
						description: errorMsg,
						status: "error",
						duration: toastDuration * 1.5, // 에러 메시지는 조금 더 오래 표시
						isClosable: isToastClosable,
					});
				}
			} finally {
				setIsLoading(false);
			}
		},
		[
			successTitle,
			successDescription,
			errorTitle,
			errorDescription,
			resetDelay,
			toastDuration,
			isToastClosable,
			showToast,
			toast,
		]
	);

	return {
		copy,
		isCopied,
		isLoading,
		error,
		clearError,
		resetCopyState,
	};
}

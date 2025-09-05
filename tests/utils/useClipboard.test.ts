/**
 * useClipboard 훅 테스트
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { useClipboard } from "@/hooks/useClipboard";
import React from "react";

// Mock navigator.clipboard
const mockWriteText = jest.fn();
const mockClipboard = {
	writeText: mockWriteText,
};

Object.defineProperty(navigator, "clipboard", {
	writable: true,
	value: mockClipboard,
});

// Mock useToast
const mockToast = jest.fn();
jest.mock("@chakra-ui/react", () => ({
	...jest.requireActual("@chakra-ui/react"),
	useToast: () => mockToast,
}));

const wrapper = ({ children }: { children: React.ReactNode }) =>
	React.createElement(ChakraProvider, null, children);

describe("useClipboard", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockWriteText.mockResolvedValue(undefined);
	});

	it("should initialize with default values", () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		expect(result.current.isCopied).toBe(false);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(typeof result.current.copy).toBe("function");
	});

	it("should copy text successfully", async () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("복사할 텍스트");
		});

		expect(mockWriteText).toHaveBeenCalledWith("복사할 텍스트");
		expect(result.current.isCopied).toBe(true);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it("should show success toast by default", async () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("테스트 텍스트");
		});

		expect(mockToast).toHaveBeenCalledWith({
			title: "복사 완료!",
			description: "클립보드에 복사되었습니다.",
			status: "success",
			duration: 2000,
			isClosable: true,
		});
	});

	it("should use custom success messages", async () => {
		const { result } = renderHook(
			() =>
				useClipboard({
					successTitle: "커스텀 성공",
					successDescription: "커스텀 성공 메시지",
				}),
			{ wrapper }
		);

		await act(async () => {
			await result.current.copy("테스트");
		});

		expect(mockToast).toHaveBeenCalledWith({
			title: "커스텀 성공",
			description: "커스텀 성공 메시지",
			status: "success",
			duration: 2000,
			isClosable: true,
		});
	});

	it("should handle clipboard API errors", async () => {
		mockWriteText.mockRejectedValue(new Error("클립보드 오류"));

		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("텍스트");
		});

		expect(result.current.isCopied).toBe(false);
		expect(result.current.error).toBe("클립보드 오류");
		expect(mockToast).toHaveBeenCalledWith({
			title: "복사 실패",
			description: "클립보드 오류",
			status: "error",
			duration: 3000,
			isClosable: true,
		});
	});

	it("should handle missing clipboard API", async () => {
		// clipboard API를 일시적으로 제거
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, "clipboard", {
			value: undefined,
			writable: true,
			configurable: true,
		});

		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("텍스트");
		});

		expect(result.current.error).toBe("클립보드 API가 지원되지 않습니다.");

		// clipboard API 복원
		Object.defineProperty(navigator, "clipboard", {
			value: originalClipboard,
			writable: true,
			configurable: true,
		});
	});

	it("should reject empty text", async () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("");
		});

		expect(mockWriteText).not.toHaveBeenCalled();
		expect(result.current.error).toBe("복사할 텍스트가 없습니다.");
	});

	it("should reject whitespace-only text", async () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("   ");
		});

		expect(mockWriteText).not.toHaveBeenCalled();
		expect(result.current.error).toBe("복사할 텍스트가 없습니다.");
	});

	it("should show loading state during copy operation", async () => {
		let resolvePromise: (value: void) => void;
		const delayedPromise = new Promise<void>((resolve) => {
			resolvePromise = resolve;
		});
		mockWriteText.mockReturnValue(delayedPromise);

		const { result } = renderHook(() => useClipboard(), { wrapper });

		// 복사 시작 (프로미스가 해결되지 않음)
		act(() => {
			result.current.copy("텍스트");
		});

		expect(result.current.isLoading).toBe(true);

		// 프로미스 해결
		await act(async () => {
			resolvePromise();
			await delayedPromise;
		});

		expect(result.current.isLoading).toBe(false);
	});

	it("should reset copied state after delay", async () => {
		const { result } = renderHook(() => useClipboard({ resetDelay: 100 }), {
			wrapper,
		});

		await act(async () => {
			await result.current.copy("텍스트");
		});

		expect(result.current.isCopied).toBe(true);

		// resetDelay 후 자동으로 리셋되어야 함
		await waitFor(
			() => {
				expect(result.current.isCopied).toBe(false);
			},
			{ timeout: 200 }
		);
	});

	it("should clear error manually", async () => {
		mockWriteText.mockRejectedValue(new Error("테스트 오류"));

		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("텍스트");
		});

		expect(result.current.error).toBeTruthy();

		act(() => {
			result.current.clearError();
		});

		expect(result.current.error).toBeNull();
	});

	it("should reset copy state manually", async () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			await result.current.copy("텍스트");
		});

		expect(result.current.isCopied).toBe(true);

		act(() => {
			result.current.resetCopyState();
		});

		expect(result.current.isCopied).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it("should disable toast when showToast is false", async () => {
		const { result } = renderHook(() => useClipboard({ showToast: false }), {
			wrapper,
		});

		await act(async () => {
			await result.current.copy("텍스트");
		});

		expect(mockToast).not.toHaveBeenCalled();
		expect(result.current.isCopied).toBe(true);
	});

	it("should use custom toast duration", async () => {
		const { result } = renderHook(() => useClipboard({ toastDuration: 5000 }), {
			wrapper,
		});

		await act(async () => {
			await result.current.copy("텍스트");
		});

		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				duration: 5000,
			})
		);
	});

	it("should handle multiple rapid copy calls", async () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		await act(async () => {
			// 빠른 연속 호출
			await result.current.copy("텍스트1");
		});

		await act(async () => {
			await result.current.copy("텍스트2");
		});

		await act(async () => {
			await result.current.copy("텍스트3");
		});

		// 마지막 호출만 처리되어야 함
		expect(mockWriteText).toHaveBeenLastCalledWith("텍스트3");
		expect(result.current.isCopied).toBe(true);
	});

	it("should handle concurrent copy operations", async () => {
		const { result } = renderHook(() => useClipboard(), { wrapper });

		const promises = [
			result.current.copy("텍스트1"),
			result.current.copy("텍스트2"),
			result.current.copy("텍스트3"),
		];

		await act(async () => {
			await Promise.all(promises);
		});

		expect(result.current.isCopied).toBe(true);
		expect(result.current.isLoading).toBe(false);
	});
});

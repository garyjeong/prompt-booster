"use client";

import {
    clearPromptData,
    getPromptData,
    hasPromptData,
    restorePromptState,
    setPromptData,
} from "@/lib/localstorage";
import { getCurrentTimestamp } from "@/lib/utils";
import type { PromptContextType, PromptState } from "@/types/prompt";
import { DEFAULT_PROMPT_STATE } from "@/types/prompt";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

/** PromptContext 생성 */
const PromptContext = createContext<PromptContextType | undefined>(undefined);

/** PromptProvider Props */
interface PromptProviderProps {
	children: ReactNode;
}

/** PromptProvider 컴포넌트 */
export function PromptProvider({ children }: PromptProviderProps) {
	const [state, setState] = useState<PromptState>(DEFAULT_PROMPT_STATE);

	// 컴포넌트 마운트 시 LocalStorage에서 데이터 복원
	useEffect(() => {
		const loadPromptData = async () => {
			setState((prev) => ({ ...prev, isLoading: true }));

			try {
				const savedData = getPromptData();
				if (savedData) {
					const restoredState = restorePromptState(savedData);
					setState(restoredState);
				} else {
					setState((prev) => ({ ...prev, isLoading: false }));
				}
			} catch (error) {
				console.error("프롬프트 데이터 복원 실패:", error);
				setState((prev) => ({ ...prev, isLoading: false }));
			}
		};

		loadPromptData();
	}, []);

	// 자동 저장 함수
	const saveToStorage = useCallback(
		(newState: PromptState) => {
			if (newState.autoSave) {
				try {
					setPromptData(newState);
				} catch (error) {
					console.error("자동 저장 실패:", error);
				}
			}
		},
		[]
	);

	// 상태 업데이트 헬퍼
	const updateState = useCallback(
		(updater: (prev: PromptState) => PromptState) => {
			setState((prev) => {
				const newState = updater(prev);
				saveToStorage(newState);
				return newState;
			});
		},
		[saveToStorage]
	);

	// 원본 프롬프트 설정
	const setOriginalPrompt = useCallback(
		(prompt: string) => {
			updateState((prev) => ({
				...prev,
				current: {
					...prev.current,
					originalPrompt: prompt,
					lastUpdated: getCurrentTimestamp(),
				},
			}));
		},
		[updateState]
	);

	// 개선된 프롬프트 설정
	const setImprovedPrompt = useCallback(
		(prompt: string) => {
			updateState((prev) => ({
				...prev,
				current: {
					...prev.current,
					improvedPrompt: prompt,
					lastUpdated: getCurrentTimestamp(),
				},
			}));
		},
		[updateState]
	);

	// 로딩 상태 설정
	const setLoading = useCallback(
		(loading: boolean) => {
			setState((prev) => ({
				...prev,
				current: {
					...prev.current,
					isLoading: loading,
				},
			}));
		},
		[]
	);

	// 에러 설정
	const setError = useCallback(
		(error: string) => {
			setState((prev) => ({
				...prev,
				current: {
					...prev.current,
					error,
				},
			}));
		},
		[]
	);

	// 에러 초기화
	const clearError = useCallback(() => {
		setState((prev) => ({
			...prev,
			current: {
				...prev.current,
				error: "",
			},
		}));
	}, []);

	// 현재 상태 초기화
	const clearCurrent = useCallback(() => {
		updateState((prev) => ({
			...prev,
			current: {
				originalPrompt: "",
				improvedPrompt: "",
				isLoading: false,
				error: "",
				lastUpdated: getCurrentTimestamp(),
			},
		}));
	}, [updateState]);

	// 히스토리에 세션 추가
	// 모든 데이터 초기화
	const resetAll = useCallback(() => {
		try {
			clearPromptData();
			setState(DEFAULT_PROMPT_STATE);
		} catch (error) {
			console.error("데이터 초기화 실패:", error);
		}
	}, []);

	// Context value 구성
	const contextValue: PromptContextType = {
		// State
		...state,
		// Actions
		setOriginalPrompt,
		setImprovedPrompt,
		setLoading,
		setError,
		clearError,
		clearCurrent,
		resetAll,
	};

	return (
		<PromptContext.Provider value={contextValue}>
			{children}
		</PromptContext.Provider>
	);
}

/** PromptContext 사용 훅 */
export function usePromptState(): PromptContextType {
	const context = useContext(PromptContext);
	if (context === undefined) {
		throw new Error("usePromptState must be used within a PromptProvider");
	}
	return context;
}

/** 현재 프롬프트 상태만 사용하는 훅 */
export function useCurrentPrompt() {
	const { current, setOriginalPrompt, setImprovedPrompt, setLoading, setError, clearError } = 
		usePromptState();
	
	return {
		current,
		setOriginalPrompt,
		setImprovedPrompt,
		setLoading,
		setError,
		clearError,
	};
}

/** 히스토리 관련 기능만 사용하는 훅 */
/** 자동 저장 상태 확인 훅 */
export function useAutoSave() {
	const { autoSave } = usePromptState();
	return autoSave;
}

/** 프롬프트 데이터 존재 여부 확인 훅 */
export function useHasPromptData() {
	const [hasData, setHasData] = useState(false);

	useEffect(() => {
		setHasData(hasPromptData());
	}, []);

	return hasData;
}

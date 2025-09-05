/**
 * LocalStorage 유틸리티 함수들과 새로운 OOP 기반 스토리지 매니저 테스트
 */

import {
	getApiKeys,
	setApiKeys,
	getApiKey,
	setApiKey,
	removeApiKey,
	clearApiKeys,
	hasApiKey,
	hasAnyApiKey,
	maskApiKey,
	type ApiKeys,
	getPromptData,
	setPromptData,
	restorePromptState,
	clearPromptData,
} from "@/lib/localstorage";
import { ApiKeyStorageManager } from "@/lib/storage/ApiKeyStorageManager";

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	hasOwnProperty: jest.fn(),
	key: jest.fn(),
	length: 0,
};

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
	writable: true,
});

describe("LocalStorage API Keys (New OOP Implementation)", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		localStorageMock.clear();
	});

	describe("getApiKeys", () => {
		it("should return empty object when no data stored", async () => {
			localStorageMock.getItem.mockReturnValue(null);

			const result = await getApiKeys();

			expect(result).toEqual({});
		});

		it("should return parsed API keys when stored", async () => {
			const mockKeys: ApiKeys = {
				openai: "sk-test-openai-key",
				gemini: "test-gemini-key",
			};
			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockKeys));

			const result = await getApiKeys();

			expect(result).toEqual(mockKeys);
		});

		it("should return empty object when parsing fails", async () => {
			localStorageMock.getItem.mockReturnValue("invalid-json");

			const result = await getApiKeys();

			expect(result).toEqual({});
		});
	});

	describe("setApiKeys", () => {
		it("should store API keys successfully", async () => {
			const testKeys: ApiKeys = {
				gemini: "test-gemini-key",
			};

			await setApiKeys(testKeys);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"prompt_booster_api_keys",
				JSON.stringify(testKeys)
			);
		});

		it("should handle storage errors gracefully", async () => {
			const testKeys: ApiKeys = { gemini: "test-key" };
			localStorageMock.setItem.mockImplementation(() => {
				throw new Error("Storage error");
			});

			await expect(setApiKeys(testKeys)).rejects.toThrow(
				"데이터 저장에 실패했습니다"
			);
		});

		it("should clean empty values before storing", async () => {
			const testKeys: ApiKeys = {
				gemini: "  valid-key  ",
			};

			// 성공적인 저장을 위해 모킹
			localStorageMock.setItem.mockReturnValue(undefined);

			await setApiKeys(testKeys);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"prompt_booster_api_keys",
				JSON.stringify({ gemini: "valid-key" })
			);
		});
	});

	describe("getApiKey", () => {
		it("should return specific API key", async () => {
			const mockKeys: ApiKeys = {
				openai: "sk-test-openai-key",
				gemini: "test-gemini-key",
			};
			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockKeys));

			const result = await getApiKey("openai");

			expect(result).toBe("sk-test-openai-key");
		});

		it("should return undefined for non-existent key", async () => {
			localStorageMock.getItem.mockReturnValue(JSON.stringify({}));

			const result = await getApiKey("openai");

			expect(result).toBeUndefined();
		});
	});

	describe("setApiKey", () => {
		it("should set individual API key", async () => {
			localStorageMock.getItem.mockReturnValue(JSON.stringify({}));
			localStorageMock.setItem.mockReturnValue(undefined);

			await setApiKey("openai", "new-test-key");

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"prompt_booster_api_keys",
				JSON.stringify({ openai: "new-test-key" })
			);
		});

		it("should reject empty keys", async () => {
			await expect(setApiKey("openai", "")).rejects.toThrow(
				"API 키가 비어있습니다"
			);
		});

		it("should reject whitespace-only keys", async () => {
			await expect(setApiKey("openai", "   ")).rejects.toThrow(
				"API 키가 비어있습니다"
			);
		});
	});

	describe("removeApiKey", () => {
		it("should remove specific API key", async () => {
			const initialKeys: ApiKeys = {
				openai: "sk-test-openai-key",
				gemini: "test-gemini-key",
			};
			localStorageMock.getItem.mockReturnValue(JSON.stringify(initialKeys));
			localStorageMock.setItem.mockReturnValue(undefined);

			await removeApiKey("openai");

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"prompt_booster_api_keys",
				JSON.stringify({ gemini: "test-gemini-key" })
			);
		});
	});

	describe("clearApiKeys", () => {
		it("should remove all API keys", async () => {
			await clearApiKeys();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith(
				"prompt_booster_api_keys"
			);
		});
	});

	describe("hasApiKey", () => {
		it("should return true when key exists and not empty", async () => {
			const mockKeys: ApiKeys = { openai: "sk-test-key" };
			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockKeys));

			const result = await hasApiKey("openai");

			expect(result).toBe(true);
		});

		it("should return false when key does not exist", async () => {
			localStorageMock.getItem.mockReturnValue(JSON.stringify({}));

			const result = await hasApiKey("openai");

			expect(result).toBe(false);
		});

		it("should return false when key is empty", async () => {
			const mockKeys: ApiKeys = { openai: "" };
			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockKeys));

			const result = await hasApiKey("openai");

			expect(result).toBe(false);
		});
	});

	describe("hasAnyApiKey", () => {
		it("should return true when any key exists", async () => {
			const mockKeys: ApiKeys = { gemini: "test-gemini-key" };
			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockKeys));

			const result = await hasAnyApiKey();

			expect(result).toBe(true);
		});

		it("should return false when no keys exist", async () => {
			localStorageMock.getItem.mockReturnValue(JSON.stringify({}));

			const result = await hasAnyApiKey();

			expect(result).toBe(false);
		});
	});

	describe("maskApiKey (Static Method)", () => {
		it("should mask API key correctly", () => {
			const key = "sk-proj1234567890abcdef";
			const result = maskApiKey(key);

			expect(result).toBe("sk-p****cdef");
		});

		it("should handle short keys", () => {
			const key = "short";
			const result = maskApiKey(key);

			expect(result).toBe("****");
		});

		it("should handle empty keys", () => {
			const result = maskApiKey("");

			expect(result).toBe("****");
		});
	});
});

describe("ApiKeyStorageManager Direct Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		localStorageMock.clear();
	});

	describe("Key Validation", () => {
		it("should reject OpenAI key format (not supported)", () => {
			// OpenAI는 더 이상 지원하지 않음
			expect(
				ApiKeyStorageManager.validateKeyFormat(
					"openai" as any,
					"sk-test1234567890123456789012345678901234567890"
				)
			).toBe(false);

			expect(
				ApiKeyStorageManager.validateKeyFormat("openai" as any, "invalid-key")
			).toBe(false);

			expect(ApiKeyStorageManager.validateKeyFormat("openai" as any, "")).toBe(
				false
			);
		});

		it("should validate Gemini key format", () => {
			expect(
				ApiKeyStorageManager.validateKeyFormat(
					"gemini",
					"AIzaSyC123456789012345678901234567890"
				)
			).toBe(true);

			expect(
				ApiKeyStorageManager.validateKeyFormat("gemini", "invalid-key")
			).toBe(false);

			expect(ApiKeyStorageManager.validateKeyFormat("gemini", "")).toBe(false);
		});
	});

	describe("Key Masking", () => {
		it("should mask keys with exactly 4 asterisks", () => {
			const longKey = "sk-proj-CWPbYq3Qedz7yD7ModW20iyOBrwwsb18633nK0";
			const result = ApiKeyStorageManager.maskKey(longKey);

			expect(result).toBe("sk-p****3nK0");
			expect(result.match(/\*/g)?.length).toBe(4);
		});

		it("should handle various key lengths consistently", () => {
			const shortKey = "sk-test12";
			const result = ApiKeyStorageManager.maskKey(shortKey);

			expect(result).toBe("sk-t****st12");
		});
	});
});

describe("Prompt Data Management (Legacy Functions)", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		localStorageMock.clear();
	});

	describe("getPromptData", () => {
		it("should return null when no data stored", () => {
			localStorageMock.getItem.mockReturnValue(null);

			const result = getPromptData();

			expect(result).toBeNull();
		});

		it("should return parsed prompt data when stored", () => {
			const mockData = {
				state: { originalPrompt: "test", improvedPrompt: "", isLoading: false },
				history: [],
				savedAt: "2023-01-01T00:00:00.000Z",
				lastUpdated: "2023-01-01T00:00:00.000Z",
			};
			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

			const result = getPromptData();

			expect(result).toEqual(mockData);
		});

		it("should return null when parsing fails", () => {
			localStorageMock.getItem.mockReturnValue("invalid-json");

			const result = getPromptData();

			expect(result).toBeNull();
		});
	});

	describe("setPromptData", () => {
		it("should store prompt data successfully", () => {
			const testState = {
				current: { originalPrompt: "test", improvedPrompt: "" },
				history: [],
				autoSave: true,
			};

			setPromptData(testState);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"prompt_booster_prompt_data",
				expect.stringContaining('"originalPrompt":"test"')
			);
		});

		it("should handle storage errors gracefully", () => {
			const testState = {
				current: { originalPrompt: "test", improvedPrompt: "" },
				history: [],
				autoSave: true,
			};
			localStorageMock.setItem.mockImplementation(() => {
				throw new Error("Storage error");
			});

			expect(() => setPromptData(testState)).toThrow("Storage error");
		});
	});

	describe("restorePromptState", () => {
		it("should restore valid prompt state", () => {
			const mockData = {
				current: {
					originalPrompt: "test",
					improvedPrompt: "improved",
					lastUpdated: "2023-01-01T00:00:00.000Z",
				},
				history: {
					sessions: [],
					maxHistory: 10,
					lastCleared: "2023-01-01T00:00:00.000Z",
				},
				autoSave: true,
				savedAt: "2023-01-01T00:00:00.000Z",
			};

			const result = restorePromptState(mockData);

			expect(result.current.originalPrompt).toBe("test");
			expect(result.current.improvedPrompt).toBe("improved");
			expect(result.current.isLoading).toBe(false);
		});

		it("should return default state when no data", () => {
			localStorageMock.getItem.mockReturnValue(null);

			const result = getPromptData();

			expect(result).toBeNull();
		});
	});

	describe("clearPromptData", () => {
		it("should clear all prompt data", () => {
			clearPromptData();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith(
				"prompt_booster_prompt_data"
			);
		});
	});
});

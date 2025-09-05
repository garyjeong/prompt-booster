'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ApiKeys, 
  getApiKeys, 
  setApiKeys as saveApiKeys, 
  hasApiKey
} from '@/lib/localstorage';

interface ApiKeyContextType {
  /** 현재 저장된 API 키들 */
  apiKeys: ApiKeys;
  /** API 키들이 로딩 중인지 여부 */
  isLoading: boolean;
  /** 어떤 API 키라도 설정되어 있는지 여부 */
  hasKeys: boolean;
  /** 특정 프로바이더의 API 키가 있는지 확인 */
  hasKey: (provider: keyof ApiKeys) => Promise<boolean>;
  /** API 키 저장 */
  setApiKeys: (keys: ApiKeys) => Promise<void>;
  /** 특정 API 키 저장 */
  setApiKey: (provider: keyof ApiKeys, key: string) => Promise<void>;
  /** 특정 API 키 삭제 */
  removeApiKey: (provider: keyof ApiKeys) => Promise<void>;
  /** 모든 API 키 삭제 */
  clearApiKeys: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKeys, setApiKeysState] = useState<ApiKeys>({});
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 LocalStorage에서 API 키 로드
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const savedKeys = await getApiKeys();
        setApiKeysState(savedKeys);
      } catch (error) {
        console.error('API 키 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApiKeys();
  }, []);

  // API 키들 저장 (LocalStorage + State 업데이트)
  const setApiKeys = async (keys: ApiKeys) => {
    try {
      await saveApiKeys(keys);
      setApiKeysState(keys);
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      throw error;
    }
  };

  // 특정 API 키 저장
  const setApiKey = async (provider: keyof ApiKeys, key: string) => {
    const newKeys = { ...apiKeys, [provider]: key };
    await setApiKeys(newKeys);
  };

  // 특정 API 키 삭제
  const removeApiKey = async (provider: keyof ApiKeys) => {
    const newKeys = { ...apiKeys };
    delete newKeys[provider];
    await setApiKeys(newKeys);
  };

  // 모든 API 키 삭제
  const clearApiKeys = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('prompt_booster_api_keys');
      }
      setApiKeysState({});
    } catch (error) {
      console.error('API 키 삭제 실패:', error);
    }
  };

  // 특정 프로바이더의 키가 있는지 확인
  const hasKey = async (provider: keyof ApiKeys): Promise<boolean> => {
    return await hasApiKey(provider);
  };

  // 어떤 키라도 있는지 확인 (상태에서 확인)
  const hasKeys = Boolean(apiKeys.gemini);

  const value: ApiKeyContextType = {
    apiKeys,
    isLoading,
    hasKeys,
    hasKey,
    setApiKeys,
    setApiKey,
    removeApiKey,
    clearApiKeys,
  };

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  );
}

/**
 * API 키 Context를 사용하기 위한 Hook
 * @returns ApiKeyContextType
 */
export function useApiKeys(): ApiKeyContextType {
  const context = useContext(ApiKeyContext);
  
  if (context === undefined) {
    throw new Error('useApiKeys는 ApiKeyProvider 내부에서만 사용할 수 있습니다.');
  }
  
  return context;
}

/**
 * 데모 모드인지 확인하는 Hook
 * @returns API 키가 없으면 true (데모 모드)
 */
export function useIsDemoMode(): boolean {
  const { hasKeys, isLoading } = useApiKeys();
  
  // 로딩 중이면 데모 모드가 아님 (아직 확정되지 않음)
  if (isLoading) {
    return false;
  }
  
  return !hasKeys;
}

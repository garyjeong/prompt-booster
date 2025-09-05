/**
 * 저장소 관리 인터페이스
 * 다양한 저장소 구현체에 대한 공통 인터페이스 제공
 */
export interface IStorageManager<T> {
	/**
	 * 데이터를 저장합니다.
	 * @param data 저장할 데이터
	 */
	save(data: T): Promise<void>;

	/**
	 * 데이터를 불러옵니다.
	 * @returns 저장된 데이터 또는 null
	 */
	load(): Promise<T | null>;

	/**
	 * 데이터를 삭제합니다.
	 */
	delete(): Promise<void>;

	/**
	 * 데이터의 존재 여부를 확인합니다.
	 * @returns 데이터 존재 여부
	 */
	exists(): Promise<boolean>;

	/**
	 * 데이터를 업데이트합니다.
	 * @param updater 업데이트 함수
	 */
	update(updater: (current: T | null) => T): Promise<void>;
}

/**
 * 저장소 설정 인터페이스
 */
export interface StorageConfig {
	/** 저장소 키 */
	key: string;
	/** 기본값 생성 함수 */
	defaultValueFactory?: () => unknown;
	/** 데이터 검증 함수 */
	validator?: (data: unknown) => boolean;
	/** 암호화 여부 */
	encrypted?: boolean;
	/** 만료 시간 (밀리초) */
	ttl?: number;
}

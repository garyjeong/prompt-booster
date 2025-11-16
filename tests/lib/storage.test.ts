/**
 * 로컬 스토리지 관리 테스트
 */

import {
	saveSessionToStorage,
	loadSessionFromStorage,
	clearSessionFromStorage,
	getSessionList,
	loadSessionById,
	deleteSession,
	updateAnswerInStorage,
	type ChatSessionStorage,
} from '@/lib/storage';
import { STORAGE_KEY } from '@/config';

// SESSION_LIST_KEY는 내부 상수이므로 직접 정의
const SESSION_LIST_KEY = 'prompt-booster-chat-sessions';

describe('Storage', () => {
	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});

	describe('saveSessionToStorage', () => {
		it('세션을 로컬 스토리지에 저장해야 함', () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				currentQuestion: '테스트 질문',
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
				title: '테스트 세션',
			};

			saveSessionToStorage(session);

			expect(localStorage.setItem).toHaveBeenCalled();
			const saved = loadSessionFromStorage();
			expect(saved).toBeTruthy();
			expect(saved?.sessionId).toBe('test-session-1');
		});

		it('세션 목록에도 추가해야 함', () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
			};

			saveSessionToStorage(session);

			const list = getSessionList();
			expect(list.sessions.length).toBeGreaterThan(0);
			expect(list.sessions[0].sessionId).toBe('test-session-1');
		});

		it('기존 세션을 업데이트해야 함', () => {
			const session1: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
			};

			saveSessionToStorage(session1);

			const session2: ChatSessionStorage = {
				...session1,
				title: '업데이트된 제목',
				updatedAt: new Date('2024-01-02'),
			};

			saveSessionToStorage(session2);

			const list = getSessionList();
			expect(list.sessions.length).toBe(1);
			expect(list.sessions[0].title).toBe('업데이트된 제목');
		});
	});

	describe('loadSessionFromStorage', () => {
		it('저장된 세션을 불러와야 함', () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
			};

			saveSessionToStorage(session);
			const loaded = loadSessionFromStorage();

			expect(loaded).toBeTruthy();
			expect(loaded?.sessionId).toBe('test-session-1');
		});

		it('세션이 없으면 null을 반환해야 함', () => {
			const loaded = loadSessionFromStorage();
			expect(loaded).toBeNull();
		});
	});

	describe('clearSessionFromStorage', () => {
		it('현재 세션을 삭제해야 함', () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
			};

			saveSessionToStorage(session);
			clearSessionFromStorage();

			const loaded = loadSessionFromStorage();
			expect(loaded).toBeNull();
		});
	});

	describe('getSessionList', () => {
		it('세션 목록을 반환해야 함', () => {
			const session1: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
			};

			const session2: ChatSessionStorage = {
				sessionId: 'test-session-2',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-02'),
				updatedAt: new Date('2024-01-02'),
			};

			saveSessionToStorage(session1);
			saveSessionToStorage(session2);

			const list = getSessionList();
			expect(list.sessions.length).toBe(2);
		});

		it('세션이 없으면 빈 배열을 반환해야 함', () => {
			const list = getSessionList();
			expect(list.sessions).toEqual([]);
		});
	});

	describe('loadSessionById', () => {
		it('세션 ID로 세션을 불러와야 함', () => {
			const session: ChatSessionStorage = {
				sessionId: 'test-session-1',
				questionAnswers: [],
				isCompleted: false,
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-01'),
			};

			saveSessionToStorage(session);
			const loaded = loadSessionById('test-session-1');

			expect(loaded).toBeTruthy();
			expect(loaded?.sessionId).toBe('test-session-1');
		});

		it('존재하지 않는 세션은 null을 반환해야 함', () => {
			const loaded = loadSessionById('non-existent');
			expect(loaded).toBeNull();
		});
	});

  describe('deleteSession', () => {
    it('세션을 삭제해야 함', () => {
      const session: ChatSessionStorage = {
        sessionId: 'test-session-1',
        questionAnswers: [],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      saveSessionToStorage(session);
      deleteSession('test-session-1');

      const list = getSessionList();
      expect(list.sessions.find((s) => s.sessionId === 'test-session-1')).toBeUndefined();
    });
  });

  describe('updateAnswerInStorage', () => {
    it('답변을 업데이트해야 함', () => {
      const session: ChatSessionStorage = {
        sessionId: 'test-session-1',
        questionAnswers: [
          {
            id: 'qa-1',
            question: '질문 1',
            answer: '답변 1',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      saveSessionToStorage(session);
      updateAnswerInStorage(1, '수정된 답변');

      const updated = loadSessionFromStorage();
      expect(updated?.questionAnswers[0].answer).toBe('수정된 답변');
    });

    it('세션이 없으면 아무것도 하지 않아야 함', () => {
      updateAnswerInStorage(1, '답변');
      // 에러가 발생하지 않아야 함
    });

    it('존재하지 않는 order는 업데이트하지 않아야 함', () => {
      const session: ChatSessionStorage = {
        sessionId: 'test-session-1',
        questionAnswers: [
          {
            id: 'qa-1',
            question: '질문 1',
            answer: '답변 1',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      saveSessionToStorage(session);
      updateAnswerInStorage(999, '답변');

      const updated = loadSessionFromStorage();
      expect(updated?.questionAnswers[0].answer).toBe('답변 1');
    });
  });

  describe('saveSessionToStorage - edge cases', () => {
    it('50개를 초과하면 오래된 세션을 삭제해야 함', () => {
      // 51개의 세션 생성
      for (let i = 0; i < 51; i++) {
        const session: ChatSessionStorage = {
          sessionId: `test-session-${i}`,
          questionAnswers: [],
          isCompleted: false,
          createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
          updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        };
        saveSessionToStorage(session);
      }

      const list = getSessionList();
      expect(list.sessions.length).toBe(50);
      // 가장 오래된 세션은 삭제되어야 함
      expect(list.sessions.find((s) => s.sessionId === 'test-session-0')).toBeUndefined();
    });

    it('Date 객체와 문자열 모두 처리해야 함', () => {
      const session1: ChatSessionStorage = {
        sessionId: 'test-session-1',
        questionAnswers: [],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      saveSessionToStorage(session1);

      const session2: ChatSessionStorage = {
        sessionId: 'test-session-2',
        questionAnswers: [],
        isCompleted: false,
        createdAt: '2024-01-02' as any,
        updatedAt: '2024-01-02' as any,
      };

      saveSessionToStorage(session2);

      const list = getSessionList();
      expect(list.sessions.length).toBe(2);
    });

    it('title이 없으면 첫 번째 답변의 일부를 사용해야 함', () => {
      const session: ChatSessionStorage = {
        sessionId: 'test-session-1',
        questionAnswers: [
          {
            id: 'qa-1',
            question: '질문 1',
            answer: '이것은 매우 긴 답변입니다. 50자를 넘어가는 답변입니다.',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      saveSessionToStorage(session);

      const list = getSessionList();
      expect(list.sessions[0].title).toBe('이것은 매우 긴 답변입니다. 50자를 넘어가는 답변입니다.'.substring(0, 50));
    });

    it('답변도 없으면 "새 채팅"을 제목으로 사용해야 함', () => {
      const session: ChatSessionStorage = {
        sessionId: 'test-session-1',
        questionAnswers: [],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      saveSessionToStorage(session);

      const list = getSessionList();
      expect(list.sessions[0].title).toBe('새 채팅');
    });

    it('로컬 스토리지 저장 실패 시 에러를 처리해야 함', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const session: ChatSessionStorage = {
        sessionId: 'test-session-1',
        questionAnswers: [],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      // 에러가 발생해도 앱이 크래시하지 않아야 함
      expect(() => saveSessionToStorage(session)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadSessionFromStorage - edge cases', () => {
    it('잘못된 JSON은 null을 반환해야 함', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      const result = loadSessionFromStorage();
      expect(result).toBeNull();
    });

    it('로컬 스토리지 불러오기 실패 시 null을 반환해야 함', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const result = loadSessionFromStorage();
      expect(result).toBeNull();

      localStorage.getItem = originalGetItem;
    });
  });

  describe('getSessionList - edge cases', () => {
    it('잘못된 JSON은 빈 배열을 반환해야 함', () => {
      localStorage.setItem(SESSION_LIST_KEY, 'invalid json');

      const list = getSessionList();
      expect(list.sessions).toEqual([]);
    });

    it('로컬 스토리지 불러오기 실패 시 빈 배열을 반환해야 함', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const list = getSessionList();
      expect(list.sessions).toEqual([]);

      localStorage.getItem = originalGetItem;
    });
  });

  describe('deleteSession - edge cases', () => {
    it('로컬 스토리지 삭제 실패 시 에러를 처리해야 함', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      // 에러가 발생해도 앱이 크래시하지 않아야 함
      expect(() => deleteSession('test-session-1')).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });
});


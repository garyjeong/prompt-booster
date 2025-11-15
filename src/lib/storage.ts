/**
 * 로컬 스토리지 관리
 */

import type { QuestionAnswer } from '@/types/chat';
import { STORAGE_KEY } from '@/config';

export interface ChatSessionStorage {
  sessionId: string;
  questionAnswers: QuestionAnswer[];
  currentQuestion?: string;
  isCompleted: boolean;
  projectDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string; // 첫 번째 답변 또는 프로젝트 이름
}

export interface ChatSessionList {
  sessions: ChatSessionStorage[];
}

const SESSION_LIST_KEY = 'prompt-booster-chat-sessions';

/**
 * 현재 세션 저장
 */
export function saveSessionToStorage(session: ChatSessionStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...session,
      createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
      updatedAt: session.updatedAt instanceof Date ? session.updatedAt.toISOString() : session.updatedAt,
    }));
    
    // 세션 목록에도 추가/업데이트
    const sessionList = getSessionList();
    const existingIndex = sessionList.sessions.findIndex(s => s.sessionId === session.sessionId);
    
    const sessionToSave = {
      ...session,
      createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt),
      updatedAt: session.updatedAt instanceof Date ? session.updatedAt : new Date(session.updatedAt),
      title: session.title || session.questionAnswers[0]?.answer?.substring(0, 50) || '새 채팅',
    };
    
    if (existingIndex >= 0) {
      sessionList.sessions[existingIndex] = sessionToSave;
    } else {
      sessionList.sessions.unshift(sessionToSave);
    }
    
    // 최대 50개까지만 저장
    if (sessionList.sessions.length > 50) {
      sessionList.sessions = sessionList.sessions.slice(0, 50);
    }
    
    localStorage.setItem(SESSION_LIST_KEY, JSON.stringify({
      sessions: sessionList.sessions.map(s => ({
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
      })),
    }));
  } catch (error) {
    console.error('로컬 스토리지 저장 실패:', error);
  }
}

/**
 * 현재 세션 불러오기
 */
export function loadSessionFromStorage(): ChatSessionStorage | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as ChatSessionStorage;
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch (error) {
    console.error('로컬 스토리지 불러오기 실패:', error);
    return null;
  }
}

/**
 * 현재 세션 초기화
 */
export function clearSessionFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('로컬 스토리지 삭제 실패:', error);
  }
}

/**
 * 세션 목록 가져오기
 */
export function getSessionList(): ChatSessionList {
  try {
    const stored = localStorage.getItem(SESSION_LIST_KEY);
    if (!stored) return { sessions: [] };
    const parsed = JSON.parse(stored) as ChatSessionList;
    return {
      sessions: parsed.sessions.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      })),
    };
  } catch (error) {
    console.error('세션 목록 불러오기 실패:', error);
    return { sessions: [] };
  }
}

/**
 * 특정 세션 불러오기
 */
export function loadSessionById(sessionId: string): ChatSessionStorage | null {
  const sessionList = getSessionList();
  const session = sessionList.sessions.find(s => s.sessionId === sessionId);
  return session || null;
}

/**
 * 세션 삭제
 */
export function deleteSession(sessionId: string): void {
  try {
    const sessionList = getSessionList();
    sessionList.sessions = sessionList.sessions.filter(s => s.sessionId !== sessionId);
    localStorage.setItem(SESSION_LIST_KEY, JSON.stringify({
      sessions: sessionList.sessions.map(s => ({
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
      })),
    }));
  } catch (error) {
    console.error('세션 삭제 실패:', error);
  }
}

/**
 * 답변 업데이트
 */
export function updateAnswerInStorage(order: number, answer: string): void {
  const session = loadSessionFromStorage();
  if (!session) return;

  const qaIndex = session.questionAnswers.findIndex((qa) => qa.order === order);
  if (qaIndex !== -1) {
    session.questionAnswers[qaIndex].answer = answer;
    session.questionAnswers[qaIndex].updatedAt = new Date();
    session.updatedAt = new Date();
    saveSessionToStorage(session);
  }
}


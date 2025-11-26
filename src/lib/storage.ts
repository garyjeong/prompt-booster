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
  isDeleted?: boolean;
  deletedAt?: Date | null;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeSession(session)));
    
    // 세션 목록에도 추가/업데이트
    const sessionList = getSessionList();
    const existingIndex = sessionList.sessions.findIndex(s => s.sessionId === session.sessionId);
    
    const sessionToSave: ChatSessionStorage = {
      ...session,
      createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt),
      updatedAt: session.updatedAt instanceof Date ? session.updatedAt : new Date(session.updatedAt),
      title: session.title || session.questionAnswers[0]?.answer?.substring(0, 50) || '새 채팅',
      isDeleted: session.isDeleted ?? false,
      deletedAt: session.deletedAt instanceof Date
        ? session.deletedAt
        : session.deletedAt
        ? new Date(session.deletedAt)
        : undefined,
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
      sessions: sessionList.sessions.map(serializeSession),
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
    return deserializeSession(parsed);
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
      sessions: parsed.sessions.map(deserializeSession),
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
  softDeleteSession(sessionId);
}

export function softDeleteSession(sessionId: string): void {
  try {
    const sessionList = getSessionList();
    const session = sessionList.sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      session.isDeleted = true;
      session.deletedAt = new Date();
      saveSessionList(sessionList.sessions);
    }
  } catch (error) {
    console.error('세션 삭제 실패:', error);
  }
}

export function restoreSession(sessionId: string): void {
  try {
    const sessionList = getSessionList();
    const session = sessionList.sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      session.isDeleted = false;
      session.deletedAt = undefined;
      saveSessionList(sessionList.sessions);
    }
  } catch (error) {
    console.error('세션 복구 실패:', error);
  }
}

export function permanentlyDeleteSession(sessionId: string): void {
  try {
    const sessionList = getSessionList();
    sessionList.sessions = sessionList.sessions.filter((s) => s.sessionId !== sessionId);
    saveSessionList(sessionList.sessions);
  } catch (error) {
    console.error('세션 완전 삭제 실패:', error);
  }
}

export function clearTrashSessions(): void {
  try {
    const sessionList = getSessionList();
    sessionList.sessions = sessionList.sessions.filter((s) => !s.isDeleted);
    saveSessionList(sessionList.sessions);
  } catch (error) {
    console.error('휴지통 비우기 실패:', error);
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

function serializeSession(session: ChatSessionStorage) {
  return {
    ...session,
    createdAt: toIsoOrNow(session.createdAt),
    updatedAt: toIsoOrNow(session.updatedAt),
    deletedAt: toIsoOrNull(session.deletedAt),
  };
}

function deserializeSession(session: any): ChatSessionStorage {
  return {
    ...session,
    createdAt: toDateOrNow(session.createdAt),
    updatedAt: toDateOrNow(session.updatedAt),
    deletedAt: session.deletedAt ? toDateOrNull(session.deletedAt) ?? undefined : undefined,
    isDeleted: session.isDeleted ?? false,
  };
}

function saveSessionList(sessions: ChatSessionStorage[]): void {
  localStorage.setItem(
    SESSION_LIST_KEY,
    JSON.stringify({
      sessions: sessions.map(serializeSession),
    })
  );
}

function toIsoOrNow(value?: Date | string | null): string {
  const date =
    value instanceof Date
      ? value
      : value
      ? new Date(value)
      : new Date();
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toIsoOrNull(value?: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function toDateOrNow(value?: Date | string | null): Date {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return new Date();
}

function toDateOrNull(value?: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}


/**
 * 챗봇 관련 타입 정의
 */

import { z } from 'zod';

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatSession {
  id: string;
  userId?: string;
  questionAnswers: QuestionAnswer[];
  currentQuestion?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectNameSuggestion {
  name: string;
  description?: string;
}

export interface ProjectNameSuggestionsResponse {
  suggestions: ProjectNameSuggestion[];
}

export interface NextQuestionRequest {
  sessionId?: string;
  previousAnswers: QuestionAnswer[];
  currentAnswer?: string;
}

export interface NextQuestionResponse {
  question: string;
  isComplete: boolean;
  sessionId: string;
}

export interface DocumentGenerationRequest {
  sessionId: string;
  questionAnswers: QuestionAnswer[];
}

export interface DocumentGenerationResponse {
  documentId: string;
  title: string;
  markdown: string;
  content: string;
}

/**
 * Zod 스키마: QuestionAnswer
 * API 요청/응답에서는 Date가 문자열로 직렬화되므로 string | Date를 모두 허용
 */
export const QuestionAnswerSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  order: z.number(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

/**
 * Zod 스키마: ProjectNameSuggestion
 */
export const ProjectNameSuggestionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

/**
 * Zod 스키마: ProjectNameSuggestionsResponse
 */
export const ProjectNameSuggestionsResponseSchema = z.object({
  suggestions: z.array(ProjectNameSuggestionSchema),
});

/**
 * Zod 스키마: NextQuestionRequest
 */
export const NextQuestionRequestSchema = z.object({
  sessionId: z.string().optional(),
  previousAnswers: z.array(QuestionAnswerSchema),
  currentAnswer: z.string().optional(),
});

/**
 * Zod 스키마: NextQuestionResponse
 */
export const NextQuestionResponseSchema = z.object({
  question: z.string(),
  isComplete: z.boolean(),
  sessionId: z.string(),
});

/**
 * Zod 스키마: DocumentGenerationRequest
 */
export const DocumentGenerationRequestSchema = z.object({
  sessionId: z.string(),
  questionAnswers: z.array(QuestionAnswerSchema),
});

/**
 * Zod 스키마: DocumentGenerationResponse
 */
export const DocumentGenerationResponseSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  markdown: z.string(),
  content: z.string(),
});


/**
 * 챗봇 관련 타입 정의
 */

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


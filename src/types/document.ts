/**
 * 문서 관련 타입 정의
 */

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  markdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentPreview {
  id: string;
  title: string;
  markdown: string;
  createdAt: Date;
}


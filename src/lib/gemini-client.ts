/**
 * Gemini 2.5 Flash 클라이언트
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { QuestionAnswer } from '@/types/chat';
import { GEMINI_FLASH_MODEL } from '@/config/constants';
import { getEnvConfig } from '@/config/env';


/**
 * Gemini API 키 가져오기
 */
function getGeminiApiKey(): string {
	const envConfig = getEnvConfig();
	const apiKey = envConfig.geminiApiKey;
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
	}
	return apiKey;
}

/**
 * Gemini 클라이언트 초기화
 */
function createGeminiClient() {
  const apiKey = getGeminiApiKey();
  return new GoogleGenerativeAI(apiKey);
}

/**
 * 다음 질문 생성
 */
export async function generateNextQuestion(
	previousAnswers: QuestionAnswer[],
	currentAnswer?: string
): Promise<{ question: string; isComplete: boolean }> {
	const genAI = createGeminiClient();
	const model = genAI.getGenerativeModel({ model: GEMINI_FLASH_MODEL });

  // 질문/답변 히스토리 포맷팅
  const historyText = previousAnswers
    .map((qa, index) => `질문 ${index + 1}: ${qa.question}\n답변: ${qa.answer}`)
    .join('\n\n');

  const currentAnswerText = currentAnswer ? `\n\n현재 답변: ${currentAnswer}` : '';

  const prompt = `당신은 프로젝트 문서 생성 챗봇입니다. 사용자와의 대화를 통해 프로젝트에 대한 정보를 수집하고 있습니다.

지금까지의 대화:
${historyText}${currentAnswerText}

다음 질문을 생성해주세요. 질문은:
1. 프로젝트 문서 작성에 필요한 정보를 수집하는 데 도움이 되어야 합니다
2. 명확하고 구체적이어야 합니다
3. 한 번에 하나의 정보만 물어봐야 합니다
4. 기능 명세서, PRD, TRD를 작성하는 데 필요한 정보를 중심으로 해야 합니다

만약 충분한 정보를 수집했다고 판단되면, "문서 생성을 시작하시겠습니까?"와 같은 완료 질문을 해주세요.

응답 형식:
- 질문만 출력하세요 (추가 설명 없이)
- 완료 질문인 경우 "COMPLETE:" 접두사를 붙여주세요

다음 질문:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const question = response.text().trim();

    const isComplete = question.startsWith('COMPLETE:');
    const cleanQuestion = isComplete ? question.replace('COMPLETE:', '').trim() : question;

    return {
      question: cleanQuestion,
      isComplete,
    };
  } catch (error) {
    console.error('Gemini API 에러:', error);
    
    // API 키 관련 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        throw new Error('Gemini API 키가 유효하지 않거나 만료되었습니다. 환경 변수 GEMINI_API_KEY를 확인해주세요.');
      }
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        throw new Error('Gemini API 요청이 실패했습니다. API 키와 설정을 확인해주세요.');
      }
    }
    
    throw new Error(
      `다음 질문 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

/**
 * 프로젝트 이름 추천 (3개)
 */
export async function suggestProjectNames(
  projectDescription: string
): Promise<{ name: string; description?: string }[]> {
	const genAI = createGeminiClient();
	const model = genAI.getGenerativeModel({ model: GEMINI_FLASH_MODEL });

  const prompt = `다음 프로젝트 설명을 바탕으로 적절한 프로젝트 이름 3개를 추천해주세요.

프로젝트 설명:
${projectDescription}

요구사항:
1. 각 이름은 간결하고 기억하기 쉬워야 합니다
2. 프로젝트의 목적을 잘 나타내야 합니다
3. 기술적이면서도 접근하기 쉬운 이름이어야 합니다

응답 형식 (JSON 배열):
[
  {"name": "프로젝트 이름 1", "description": "간단한 설명"},
  {"name": "프로젝트 이름 2", "description": "간단한 설명"},
  {"name": "프로젝트 이름 3", "description": "간단한 설명"}
]

JSON만 출력하세요:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // JSON 추출 (마크다운 코드 블록 제거)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('JSON 형식의 응답을 받지 못했습니다.');
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return suggestions;
  } catch (error) {
    console.error('Gemini API 에러:', error);
    
    // API 키 관련 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        throw new Error('Gemini API 키가 유효하지 않거나 만료되었습니다. 환경 변수 GEMINI_API_KEY를 확인해주세요.');
      }
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        throw new Error('Gemini API 요청이 실패했습니다. API 키와 설정을 확인해주세요.');
      }
    }
    
    throw new Error(
      `프로젝트 이름 추천 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

/**
 * 문서 생성
 */
export async function generateDocument(
  questionAnswers: QuestionAnswer[]
): Promise<{ title: string; markdown: string }> {
	const genAI = createGeminiClient();
	const model = genAI.getGenerativeModel({ model: GEMINI_FLASH_MODEL });

  // 질문/답변 히스토리 포맷팅
  const qaText = questionAnswers
    .map((qa, index) => `## 질문 ${index + 1}\n**질문:** ${qa.question}\n**답변:** ${qa.answer}`)
    .join('\n\n');

  const prompt = `다음 질문과 답변을 바탕으로 프로젝트 문서를 작성해주세요.

문서는 기능 명세서, PRD(Product Requirements Document), TRD(Technical Requirements Document)가 혼용된 형태여야 합니다.

질문과 답변:
${qaText}

문서 구조:
1. 프로젝트 개요
   - 프로젝트 이름
   - 프로젝트 목적
   - 주요 기능

2. 개발 환경 세팅
   - 필요한 도구 및 라이브러리
   - 설치 방법
   - 환경 변수 설정

3. 기능 명세서
   - 각 기능의 상세 설명
   - 사용자 스토리
   - 우선순위

4. 기술 요구사항 (TRD)
   - 기술 스택
   - 아키텍처
   - 데이터베이스 설계
   - API 설계

5. 배포 및 운영
   - 배포 방법
   - 모니터링
   - 유지보수 계획

마크다운 형식으로 작성해주세요. 전문적이고 상세하게 작성해주세요.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const markdown = response.text().trim();

    // 프로젝트 이름 추출 (첫 번째 질문/답변에서)
    const firstAnswer = questionAnswers[0]?.answer || '프로젝트';
    const title = firstAnswer.length > 50 ? firstAnswer.substring(0, 50) + '...' : firstAnswer;

    return {
      title: title || '프로젝트 문서',
      markdown,
    };
  } catch (error) {
    console.error('Gemini API 에러:', error);
    
    // API 키 관련 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        throw new Error('Gemini API 키가 유효하지 않거나 만료되었습니다. 환경 변수 GEMINI_API_KEY를 확인해주세요.');
      }
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        throw new Error('Gemini API 요청이 실패했습니다. API 키와 설정을 확인해주세요.');
      }
    }
    
    throw new Error(
      `문서 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}


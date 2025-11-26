/**
 * OpenAI GPT 클라이언트
 */

import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import type { QuestionAnswer } from '@/types/chat';
import { GPT_MODEL, PROJECT_ASSISTANT_PROMPT } from '@/config/constants';
import { getEnvConfig } from '@/config/env';

/**
 * OpenAI API 키 가져오기
 */
function getOpenAIApiKey(): string {
	const envConfig = getEnvConfig();
	const apiKey = envConfig.openaiApiKey;
	if (!apiKey) {
		console.error('OPENAI_API_KEY가 설정되지 않았습니다. 환경 변수 확인:', {
			hasApiKey: !!process.env.OPENAI_API_KEY,
			apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
			apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'N/A',
		});
		throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
	}
	// 개발 환경에서만 API 키 일부 로그 출력
	if (process.env.NODE_ENV === 'development') {
		console.log('OpenAI API 키 로드됨:', apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 10));
		console.log('API 키 길이:', apiKey.length);
		console.log('API 키 끝부분:', apiKey.substring(apiKey.length - 20));
	}
	return apiKey.trim(); // 공백 제거
}

/**
 * OpenAI 클라이언트 초기화
 * 공식 문서 방식: 환경 변수 OPENAI_API_KEY에서 자동으로 가져옴
 * Next.js 환경에서는 명시적으로 전달하는 것이 더 안정적
 */
function createOpenAIClient(): OpenAI {
	// API 키 검증 및 가져오기
	const apiKey = getOpenAIApiKey();
	
	// 개발 환경에서 실제 전달되는 키 확인
	if (process.env.NODE_ENV === 'development') {
		console.log('OpenAI 클라이언트 생성 - 전달되는 키 끝부분:', apiKey.substring(apiKey.length - 20));
		console.log('OpenAI 클라이언트 생성 - 키 전체 길이:', apiKey.length);
	}
	
	// Next.js 환경에서는 환경 변수가 제대로 전달되지 않을 수 있으므로
	// 명시적으로 API 키를 전달하는 것이 더 안정적
	// 공식 문서의 new OpenAI() 방식도 지원하지만, Next.js에서는 명시적 전달 권장
	return new OpenAI({
		apiKey: apiKey.trim(), // 공백 제거하여 전달
	});
}

/**
 * OpenAI 에러 처리 헬퍼 함수
 */
function handleOpenAIError(error: unknown, context: string): never {
	console.error(`OpenAI API 에러 (${context}):`, error);
	
	// 실제 OpenAI API 응답 상세 로깅
	if (error && typeof error === 'object') {
		const errorObj = error as Record<string, unknown>;
		console.error('에러 객체 상세:', {
			status: errorObj.status,
			code: errorObj.code,
			type: errorObj.type,
			message: errorObj.message,
			response: errorObj.response,
			error: errorObj.error,
			request_id: errorObj.request_id,
		});
	}

	// 에러 객체를 문자열로 변환 (깊은 구조까지 포함)
	const errorString = JSON.stringify(error, null, 2);
	const errorMessage = error instanceof Error ? error.message : String(error);
	
	// OpenAI SDK 에러 객체에서 status와 code 확인
	interface OpenAIError {
		status?: number;
		code?: string;
		type?: string;
		response?: { status?: number };
		error?: { code?: string; type?: string };
	}
	const errorObj = error as unknown as OpenAIError;
	const status = errorObj?.status || errorObj?.response?.status;
	const code = errorObj?.code || errorObj?.error?.code;
	const type = errorObj?.type || errorObj?.error?.type;

	// API 키 만료 또는 유효하지 않음 - 다양한 패턴 확인
	const apiKeyExpiredPatterns = [
		'API key expired',
		'API key invalid',
		'invalid_api_key',
		'authentication_error',
		'Invalid API key',
		'Incorrect API key',
		'401',
	];

	const hasApiKeyError = 
		status === 401 ||
		code === 'invalid_api_key' ||
		type === 'invalid_request_error' ||
		apiKeyExpiredPatterns.some(
			(pattern) => errorMessage.includes(pattern) || errorString.includes(pattern)
		);

	if (hasApiKeyError) {
		throw new Error(
			'OPENAI_API_KEY_EXPIRED: OpenAI API 키가 만료되었거나 유효하지 않습니다. 새로운 API 키를 발급받아 설정해주세요.'
		);
	}

	// 일반적인 API 키 관련 에러
	if (
		errorMessage.includes('API key') ||
		errorMessage.includes('API_KEY') ||
		errorString.includes('API_KEY') ||
		errorString.includes('api_key')
	) {
		throw new Error(
			'OPENAI_API_KEY_ERROR: OpenAI API 키에 문제가 있습니다. 환경 변수 OPENAI_API_KEY를 확인해주세요.'
		);
	}

	// 400 Bad Request 에러
	if (errorMessage.includes('400') || errorMessage.includes('Bad Request') || errorString.includes('400')) {
		// 에러 상세 정보 확인
		if (errorString.includes('API_KEY') || errorString.includes('API key') || errorString.includes('api_key')) {
			throw new Error(
				'OPENAI_API_KEY_ERROR: OpenAI API 키에 문제가 있습니다. 환경 변수 OPENAI_API_KEY를 확인해주세요.'
			);
		}
		throw new Error('OPENAI_API_BAD_REQUEST: OpenAI API 요청이 실패했습니다. API 키와 설정을 확인해주세요.');
	}

	// 429 Rate Limit 에러
	if (errorMessage.includes('429') || errorMessage.includes('rate_limit') || errorString.includes('429')) {
		throw new Error('OPENAI_API_RATE_LIMIT: API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
	}

	throw new Error(`OPENAI_API_ERROR: ${context} 실패: ${errorMessage}`);
}

/**
 * 다음 질문 생성
 */
export async function generateNextQuestion(
	previousAnswers: QuestionAnswer[],
	currentAnswer?: string
): Promise<{ question: string; isComplete: boolean }> {
	const client = createOpenAIClient();

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
		// o1-mini는 추론 모델이므로 temperature를 지원하지 않음
		const completionParams: ChatCompletionCreateParamsNonStreaming = {
			model: GPT_MODEL,
			messages: [
				{
					role: 'system',
					content: `${PROJECT_ASSISTANT_PROMPT}\n- 지금은 사용자 정보를 수집하는 단계이며, 한 번에 하나의 질문만 하도록 집중한다.`,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			...(GPT_MODEL.includes('o1') ? {} : { temperature: 0.7 }),
		};
		
		const completion = await client.chat.completions.create(completionParams);

		const question = completion.choices[0]?.message?.content?.trim() || '';

		if (!question) {
			throw new Error('질문을 생성하지 못했습니다.');
		}

		const isComplete = question.startsWith('COMPLETE:');
		const cleanQuestion = isComplete ? question.replace('COMPLETE:', '').trim() : question;

		return {
			question: cleanQuestion,
			isComplete,
		};
	} catch (error) {
		handleOpenAIError(error, '다음 질문 생성');
	}
}

/**
 * 프로젝트 이름 추천 (3개)
 */
export async function suggestProjectNames(
	projectDescription: string
): Promise<{ name: string; description?: string }[]> {
	const client = createOpenAIClient();

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
		// o1-mini는 추론 모델이므로 temperature와 response_format을 지원하지 않을 수 있음
		const completionParams: ChatCompletionCreateParamsNonStreaming = {
			model: GPT_MODEL,
			messages: [
				{
					role: 'system',
					content: `${PROJECT_ASSISTANT_PROMPT}\n- 지금은 사용자가 설명한 프로젝트 맥락을 바탕으로 이름만 추천해야 한다.\n- JSON 형식 이외의 텍스트는 절대 포함하지 않는다.`,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			...(GPT_MODEL.includes('o1')
				? {}
				: {
						temperature: 0.7,
						response_format: { type: 'json_object' },
					}),
		};
		
		const completion = await client.chat.completions.create(completionParams);

		const text = completion.choices[0]?.message?.content?.trim() || '';

		if (!text) {
			throw new Error('프로젝트 이름 추천을 받지 못했습니다.');
		}

		// JSON 추출 (마크다운 코드 블록 제거)
		const jsonMatch = text.match(/\[[\s\S]*\]/);
		if (!jsonMatch) {
			// JSON 객체 형식인 경우 처리
			try {
				const parsed = JSON.parse(text);
				if (Array.isArray(parsed)) {
					return parsed;
				}
				// 객체에 suggestions 키가 있는 경우
				if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
					return parsed.suggestions;
				}
			} catch {
				// JSON 파싱 실패
			}
			throw new Error('JSON 형식의 응답을 받지 못했습니다.');
		}

		const suggestions = JSON.parse(jsonMatch[0]);
		return suggestions;
	} catch (error) {
		handleOpenAIError(error, '프로젝트 이름 추천');
	}
}

/**
 * 문서 생성
 */
export async function generateDocument(questionAnswers: QuestionAnswer[]): Promise<{ title: string; markdown: string }> {
	const client = createOpenAIClient();

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
		// o1-mini는 추론 모델이므로 temperature를 지원하지 않음
		const completionParams: ChatCompletionCreateParamsNonStreaming = {
			model: GPT_MODEL,
			messages: [
				{
					role: 'system',
					content: `${PROJECT_ASSISTANT_PROMPT}\n- 지금은 모든 수집 정보를 활용해 PRD/TRD가 혼합된 마크다운 문서를 작성해야 한다.`,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			...(GPT_MODEL.includes('o1') ? {} : { temperature: 0.7 }),
		};
		
		const completion = await client.chat.completions.create(completionParams);

		const markdown = completion.choices[0]?.message?.content?.trim() || '';

		if (!markdown) {
			throw new Error('문서를 생성하지 못했습니다.');
		}

		// 프로젝트 이름 추출 (첫 번째 질문/답변에서)
		const firstAnswer = questionAnswers[0]?.answer || '프로젝트';
		const title = firstAnswer.length > 50 ? firstAnswer.substring(0, 50) + '...' : firstAnswer;

		return {
			title: title || '프로젝트 문서',
			markdown,
		};
	} catch (error) {
		handleOpenAIError(error, '문서 생성');
	}
}

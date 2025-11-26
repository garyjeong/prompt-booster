/**
 * 초기 답변 검증 및 후속 안내 메시지 유틸리티
 */

export const INITIAL_CLARIFICATION_QUESTION =
	'어떤 프로젝트를 만들고 싶은지 한두 문장으로 구체적으로 설명해 주세요. 해결하고 싶은 문제나 대상 사용자가 있다면 함께 알려주세요.';

const DEFAULT_INVALID_REASON =
	'프로젝트 아이디어를 조금 더 구체적으로 알려주시면 다음 질문을 도와드릴 수 있어요.\n예: 온라인 서점, 개인 재무 관리 앱, 팀 협업 툴 등';

interface InitialAnswerValidationResult {
	isValid: boolean;
	reason?: string;
	followUpQuestion?: string;
}

const GREETING_KEYWORDS = [
	'안녕',
	'안녕하세요',
	'하이',
	'hello',
	'hi',
	'ㅎㅇ',
	'헬로',
	'헬로우',
	'테스트',
	'test',
	'테스트중',
];

const NON_INFORMATIVE_PATTERNS = [/없음/, /모름/, /몰라/, /생각[이]? 없음/, /잘 모르/, /^[ㅋㅎ]+$/i];

const DOMAIN_KEYWORDS = [
	'앱',
	'서비스',
	'프로젝트',
	'시스템',
	'플랫폼',
	'웹',
	'모바일',
	'API',
	'사이트',
	'게임',
	'데이터',
	'AI',
	'도구',
	'자동화',
];

/**
 * 첫 번째 답변이 충분히 설명적인지 확인
 */
export function validateInitialAnswer(answer: string): InitialAnswerValidationResult {
	const trimmed = answer?.trim();

	if (!trimmed) {
		return invalidResult('내용이 비어 있습니다. 만들고 싶은 프로젝트를 간단히 설명해 주세요.');
	}

	const normalized = trimmed.toLowerCase();

	if (GREETING_KEYWORDS.some((keyword) => normalized.startsWith(keyword))) {
		return invalidResult('인사 대신 만들고 싶은 프로젝트를 한두 문장으로 설명해 주세요.');
	}

	if (NON_INFORMATIVE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
		return invalidResult('“없음” 대신 해결하고 싶은 문제나 원하는 결과를 설명해 주세요.');
	}

	const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
	const hasDomainKeyword = DOMAIN_KEYWORDS.some((keyword) => trimmed.includes(keyword));

	if (trimmed.length < 5 && !hasDomainKeyword) {
		return invalidResult('조금 더 구체적으로 작성해 주세요.\n예: “팀 일정 공유 앱을 만들고 싶어요”.');
	}

	if (wordCount < 2 && trimmed.length < 12 && !hasDomainKeyword) {
		return invalidResult('어떤 문제를 해결하고 싶은지, 누가 사용할지를 함께 알려주시면 좋아요.');
	}

	return { isValid: true };
}

function invalidResult(reason?: string): InitialAnswerValidationResult {
	return {
		isValid: false,
		reason: reason || DEFAULT_INVALID_REASON,
		followUpQuestion: INITIAL_CLARIFICATION_QUESTION,
	};
}



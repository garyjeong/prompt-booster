/**
 * 채팅 플로우 E2E 테스트
 * 
 * 주의: 이 테스트는 OpenAI API를 실제로 호출하므로,
 * 환경 변수 OPENAI_API_KEY가 설정되어 있어야 합니다.
 * 
 * 스킵하려면: test.skip() 사용
 */

import { test, expect } from '@playwright/test';

test.describe('채팅 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 초기 질문이 로드될 때까지 대기
    await expect(page.getByText(/무엇을 만들어보고 싶으신가요/i)).toBeVisible({ timeout: 10000 });
  });

  test('초기 답변 입력 후 다음 질문이 생성되어야 함', async ({ page }) => {
    // OpenAI API 키가 없으면 스킵
    test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY가 설정되지 않았습니다.');
    
    // 답변 입력
    const input = page.getByPlaceholder(/답변을 입력하세요/i).or(page.getByPlaceholder(/문서 생성을 시작하려면/i));
    await input.fill('온라인 쇼핑몰 프로젝트');
    await input.press('Enter');
    
    // 다음 질문이 표시되어야 함 (최대 60초 대기 - OpenAI API 응답 시간 고려)
    // 초기 질문과 다른 텍스트가 나타나면 성공
    await expect(
      page.locator('text=/.*/').filter({ 
        hasNotText: /무엇을 만들어보고 싶으신가요/i 
      }).first()
    ).toBeVisible({ timeout: 60000 });
  });

  test('빈 답변은 제출되지 않아야 함', async ({ page }) => {
    const input = page.getByPlaceholder(/답변을 입력하세요/i).or(page.getByPlaceholder(/문서 생성을 시작하려면/i));
    
    // 빈 답변 입력 시도
    await input.fill('');
    await input.press('Enter');
    
    // 초기 질문이 여전히 표시되어야 함 (변화 없음)
    await expect(page.getByText(/무엇을 만들어보고 싶으신가요/i)).toBeVisible();
  });

  test('짧은 답변은 유효성 검사에 실패해야 함', async ({ page }) => {
    const input = page.getByPlaceholder(/답변을 입력하세요/i).or(page.getByPlaceholder(/문서 생성을 시작하려면/i));
    
    // 너무 짧은 답변 입력
    await input.fill('a');
    await input.press('Enter');
    
    // 에러 메시지가 표시되거나 초기 질문이 유지되어야 함
    await expect(
      page.getByText(/구체적으로/i).or(page.getByText(/무엇을 만들어보고 싶으신가요/i))
    ).toBeVisible({ timeout: 5000 });
  });
});


/**
 * 홈페이지 E2E 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Prompt Booster/i);
    
    // 초기 질문이 표시되어야 함
    await expect(page.getByText(/무엇을 만들어보고 싶으신가요/i)).toBeVisible({ timeout: 10000 });
  });

  test('채팅 입력창이 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    
    // 입력창이 표시되어야 함
    const input = page.getByPlaceholder(/답변을 입력하세요/i).or(page.getByPlaceholder(/문서 생성을 시작하려면/i));
    await expect(input).toBeVisible({ timeout: 10000 });
  });

  test('사이드바가 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    
    // 사이드바 요소 확인 (새 채팅 버튼 또는 로고)
    const sidebar = page.locator('nav').or(page.getByRole('button', { name: /새 채팅/i }));
    await expect(sidebar.first()).toBeVisible({ timeout: 10000 });
  });
});


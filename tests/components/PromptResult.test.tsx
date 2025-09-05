/**
 * PromptResult 컴포넌트 테스트
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import PromptResult from '@/components/PromptResult'

// Mock CopyButton 컴포넌트
jest.mock('@/components/CopyButton', () => {
  return function MockCopyButton({ children, text }: { children: React.ReactNode, text: string }) {
    return <button data-testid="copy-button" data-text={text}>{children}</button>
  }
})

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  )
}

describe('PromptResult', () => {
  it('should show placeholder when no content is provided', () => {
    renderWithProviders(<PromptResult />)

    expect(screen.getByText(/프롬프트를 입력하고 개선 버튼을 클릭하면/i)).toBeInTheDocument()
  })

  it('should show original prompt when provided', () => {
    renderWithProviders(
      <PromptResult 
        originalPrompt="리액트에서 useState를 사용하는 방법을 알려줘"
      />
    )

    expect(screen.getByText('원본 프롬프트')).toBeInTheDocument()
    expect(screen.getByText('리액트에서 useState를 사용하는 방법을 알려줘')).toBeInTheDocument()
    expect(screen.getByText('원본')).toBeInTheDocument() // Badge
  })

  it('should show improved prompt when provided', () => {
    renderWithProviders(
      <PromptResult 
        originalPrompt="원본 프롬프트"
        improvedPrompt="개선된 프롬프트: 리액트에서 useState 훅을 사용하여 컴포넌트 상태를 관리하는 방법을 단계별로 설명해주세요."
      />
    )

    expect(screen.getByText('개선된 프롬프트')).toBeInTheDocument()
    expect(screen.getByText(/개선된 프롬프트: 리액트에서 useState 훅을 사용하여/i)).toBeInTheDocument()
    expect(screen.getByText('개선됨')).toBeInTheDocument() // Badge
  })

  it('should show copy button when improved prompt is available', () => {
    renderWithProviders(
      <PromptResult 
        originalPrompt="원본 프롬프트"
        improvedPrompt="개선된 프롬프트"
      />
    )

    const copyButton = screen.getByTestId('copy-button')
    expect(copyButton).toBeInTheDocument()
    expect(copyButton).toHaveAttribute('data-text', '개선된 프롬프트')
    expect(screen.getByText('클립보드에 복사')).toBeInTheDocument()
  })

  it('should not show copy button when no improved prompt', () => {
    renderWithProviders(
      <PromptResult 
        originalPrompt="원본 프롬프트"
      />
    )

    expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument()
  })

  it('should show loading state correctly', () => {
    renderWithProviders(
      <PromptResult 
        originalPrompt="원본 프롬프트"
        isLoading={true}
      />
    )

    // 스켈레톤 로더 확인 (Chakra UI Skeleton)
    const skeletons = document.querySelectorAll('[data-loading="true"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should show error message when error is provided', () => {
    const errorMessage = 'API 호출에 실패했습니다.'
    
    renderWithProviders(
      <PromptResult 
        originalPrompt="원본 프롬프트"
        error={errorMessage}
      />
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    // Error alert icon 확인
    expect(document.querySelector('[data-status="error"]')).toBeInTheDocument()
  })

  it('should show loading text when loading and no improved prompt', () => {
    renderWithProviders(
      <PromptResult 
        originalPrompt="원본 프롬프트"
        isLoading={false}
        improvedPrompt=""
      />
    )

    expect(screen.getByText(/프롬프트를 개선하는 중입니다/i)).toBeInTheDocument()
  })

  it('should not show original prompt section when not provided', () => {
    renderWithProviders(
      <PromptResult 
        improvedPrompt="개선된 프롬프트"
      />
    )

    expect(screen.queryByText('원본 프롬프트')).not.toBeInTheDocument()
  })

  it('should handle both original and improved prompts correctly', () => {
    const originalPrompt = '원본 프롬프트 내용'
    const improvedPrompt = '개선된 프롬프트 내용'
    
    renderWithProviders(
      <PromptResult 
        originalPrompt={originalPrompt}
        improvedPrompt={improvedPrompt}
      />
    )

    expect(screen.getByText('원본 프롬프트')).toBeInTheDocument()
    expect(screen.getByText('개선된 프롬프트')).toBeInTheDocument()
    expect(screen.getByText(originalPrompt)).toBeInTheDocument()
    expect(screen.getByText(improvedPrompt)).toBeInTheDocument()
  })

  it('should not show error when error is empty string', () => {
    renderWithProviders(
      <PromptResult 
        originalPrompt="원본 프롬프트"
        error=""
      />
    )

    expect(document.querySelector('[data-status="error"]')).not.toBeInTheDocument()
  })

  it('should show content area even when only loading', () => {
    renderWithProviders(
      <PromptResult isLoading={true} />
    )

    // 로딩 중일 때도 컨텐츠 영역이 표시되어야 함
    expect(screen.queryByText(/프롬프트를 입력하고 개선 버튼을 클릭하면/i)).not.toBeInTheDocument()
  })

  it('should handle long text content properly', () => {
    const longPrompt = 'a'.repeat(1000)
    const improvedPrompt = 'b'.repeat(1000)
    
    renderWithProviders(
      <PromptResult 
        originalPrompt={longPrompt}
        improvedPrompt={improvedPrompt}
      />
    )

    expect(screen.getByText(longPrompt)).toBeInTheDocument()
    expect(screen.getByText(improvedPrompt)).toBeInTheDocument()
  })
})

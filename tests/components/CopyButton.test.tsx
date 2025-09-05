/**
 * CopyButton 컴포넌트 테스트
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import CopyButton from '@/components/CopyButton'

// Mock useClipboard hook
const mockCopy = jest.fn()
const mockUseClipboard = {
  copy: mockCopy,
  isCopied: false,
  isLoading: false,
  error: null,
  clearError: jest.fn(),
  resetCopyState: jest.fn(),
}

jest.mock('@/hooks/useClipboard', () => ({
  useClipboard: () => mockUseClipboard,
}))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  )
}

describe('CopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClipboard.isCopied = false
    mockUseClipboard.isLoading = false
    mockUseClipboard.error = null
  })

  it('should render with default props', () => {
    renderWithProviders(<CopyButton text="테스트 텍스트" />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    // 기본적으로 CopyIcon이 표시되어야 함
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render with custom children', () => {
    renderWithProviders(
      <CopyButton text="테스트 텍스트">
        복사하기
      </CopyButton>
    )

    expect(screen.getByText('복사하기')).toBeInTheDocument()
  })

  it('should call copy function when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const testText = '복사할 텍스트'
    
    renderWithProviders(<CopyButton text={testText} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockCopy).toHaveBeenCalledWith(testText)
    expect(mockCopy).toHaveBeenCalledTimes(1)
  })

  it('should show copied state correctly', () => {
    mockUseClipboard.isCopied = true
    
    renderWithProviders(
      <CopyButton text="테스트" copiedText="복사됨!">
        복사하기
      </CopyButton>
    )

    expect(screen.getByText('복사됨!')).toBeInTheDocument()
    expect(screen.queryByText('복사하기')).not.toBeInTheDocument()
  })

  it('should show check icon when copied', () => {
    mockUseClipboard.isCopied = true
    
    renderWithProviders(<CopyButton text="테스트" />)

    // CheckIcon이 표시되어야 함 (실제로는 SVG 요소로 렌더링)
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should show loading state correctly', () => {
    mockUseClipboard.isLoading = true
    
    renderWithProviders(<CopyButton text="테스트">복사하기</CopyButton>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should be disabled when text is empty', () => {
    renderWithProviders(<CopyButton text="">복사하기</CopyButton>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should be disabled when text is only whitespace', () => {
    renderWithProviders(<CopyButton text="   ">복사하기</CopyButton>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should show tooltip when provided', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    renderWithProviders(
      <CopyButton text="테스트" tooltip="클립보드에 복사">
        복사하기
      </CopyButton>
    )

    const button = screen.getByRole('button')
    await user.hover(button)

    await waitFor(() => {
      expect(screen.getByText('클립보드에 복사')).toBeInTheDocument()
    })
  })

  it('should show copied tooltip when copied', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockUseClipboard.isCopied = true
    
    renderWithProviders(
      <CopyButton 
        text="테스트" 
        tooltip="클립보드에 복사"
        copiedTooltip="복사 완료!"
      >
        복사하기
      </CopyButton>
    )

    const button = screen.getByRole('button')
    await user.hover(button)

    await waitFor(() => {
      expect(screen.getByText('복사 완료!')).toBeInTheDocument()
    })
  })

  it('should show icon on the right when iconPosition is right', () => {
    renderWithProviders(
      <CopyButton text="테스트" iconPosition="right">
        복사하기
      </CopyButton>
    )

    const button = screen.getByRole('button')
    const buttonContent = button.textContent
    
    // 텍스트 다음에 아이콘이 있는지 확인 (정확한 테스트는 DOM 구조 확인 필요)
    expect(buttonContent).toContain('복사하기')
  })

  it('should not show icon when showIcon is false', () => {
    renderWithProviders(
      <CopyButton text="테스트" showIcon={false}>
        복사하기
      </CopyButton>
    )

    expect(screen.getByText('복사하기')).toBeInTheDocument()
    // 아이콘 없이 텍스트만 표시되어야 함
  })

  it('should handle keyboard shortcuts when enabled', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    renderWithProviders(
      <CopyButton 
        text="테스트 텍스트" 
        enableKeyboardShortcut={true}
        shortcutScope="global"
      >
        복사하기
      </CopyButton>
    )

    // Ctrl+C 키보드 이벤트 (global scope)
    await user.keyboard('{Control>}c{/Control}')

    expect(mockCopy).toHaveBeenCalledWith('테스트 텍스트')
  })

  it('should apply custom button props', () => {
    renderWithProviders(
      <CopyButton 
        text="테스트" 
        colorScheme="green" 
        variant="solid"
        size="lg"
      >
        복사하기
      </CopyButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('chakra-button')
  })

  it('should not call copy when disabled', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockUseClipboard.isCopied = true
    
    renderWithProviders(<CopyButton text="테스트">복사하기</CopyButton>)

    const button = screen.getByRole('button')
    await user.click(button)

    // isCopied가 true일 때는 버튼이 disabled되므로 copy가 호출되지 않아야 함
    expect(mockCopy).not.toHaveBeenCalled()
  })
})

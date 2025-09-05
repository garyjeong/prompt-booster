/**
 * PromptInput 컴포넌트 테스트
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import PromptInput from '@/components/PromptInput'
import { ApiKeyProvider } from '@/context/ApiKeyContext'

// Mock useIsDemoMode hook
const mockUseIsDemoMode = jest.fn()
jest.mock('@/context/ApiKeyContext', () => ({
  ...jest.requireActual('@/context/ApiKeyContext'),
  useIsDemoMode: () => mockUseIsDemoMode(),
  ApiKeyProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ApiKeyProvider>
        {ui}
      </ApiKeyProvider>
    </ChakraProvider>
  )
}

describe('PromptInput', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsDemoMode.mockReturnValue(false)
  })

  it('should render prompt input correctly', () => {
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/원본 프롬프트를 입력하세요/i)).toBeInTheDocument()
    expect(screen.getByText('프롬프트 개선하기')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/리액트에서 useState를 사용하는 방법/i)).toBeInTheDocument()
  })

  it('should show server API mode alert when not in demo mode', () => {
    mockUseIsDemoMode.mockReturnValue(true)
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/서버 API Key 모드/i)).toBeInTheDocument()
    expect(screen.getByText(/서버에서 제공하는 AI API를 사용 중입니다/i)).toBeInTheDocument()
  })

  it('should not show alert when not in demo mode', () => {
    mockUseIsDemoMode.mockReturnValue(false)
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    expect(screen.queryByText(/서버 API Key 모드/i)).not.toBeInTheDocument()
  })

  it('should handle text input correctly', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '리액트에서 useState를 사용하는 방법을 알려줘')

    expect(textarea).toHaveValue('리액트에서 useState를 사용하는 방법을 알려줘')
  })

  it('should call onSubmit when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByText('프롬프트 개선하기')

    await user.type(textarea, '테스트 프롬프트')
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith('테스트 프롬프트')
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('should call onSubmit with Ctrl+Enter shortcut', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '테스트 프롬프트')
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(mockOnSubmit).toHaveBeenCalledWith('테스트 프롬프트')
  })

  it('should disable button when prompt is empty', () => {
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const button = screen.getByText('프롬프트 개선하기')
    expect(button).toBeDisabled()
  })

  it('should enable button when prompt has content', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByText('프롬프트 개선하기')

    await user.type(textarea, '테스트')
    expect(button).not.toBeDisabled()
  })

  it('should show loading state correctly', () => {
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} isLoading={true} />)

    const button = screen.getByText('프롬프트 개선 중...')
    expect(button).toBeDisabled()
  })

  it('should limit character count in demo mode', async () => {
    const user = userEvent.setup()
    mockUseIsDemoMode.mockReturnValue(true)
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const longText = 'a'.repeat(2001) // 2000자 초과

    await user.type(textarea, longText)
    
    // 2000자까지만 입력되어야 함
    expect(textarea).toHaveValue('a'.repeat(2000))
  })

  it('should show character count in demo mode', () => {
    mockUseIsDemoMode.mockReturnValue(true)
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/0\/2000자/i)).toBeInTheDocument()
  })

  it('should show progress bar in demo mode', () => {
    mockUseIsDemoMode.mockReturnValue(true)
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    // Chakra UI Progress 컴포넌트 확인
    const progressBar = document.querySelector('[role="progressbar"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('should not submit empty or whitespace-only prompts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByText('프롬프트 개선하기')

    // 공백만 입력
    await user.type(textarea, '   ')
    await user.click(button)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should trim whitespace when submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByText('프롬프트 개선하기')

    await user.type(textarea, '  테스트 프롬프트  ')
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith('테스트 프롬프트')
  })
})

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

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /프롬프트 전송/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/리액트에서 useState를 사용하는 방법/i)).toBeInTheDocument()
  })

  it('should show server API mode alert when not in demo mode', () => {
    mockUseIsDemoMode.mockReturnValue(true)
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/서버 API 모드/i)).toBeInTheDocument()
    expect(screen.getByText(/개인 API 키를 설정하여 더 많은 기능을 사용해보세요/i)).toBeInTheDocument()
  })

  it('should not show alert when not in demo mode', () => {
    mockUseIsDemoMode.mockReturnValue(false)
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    expect(screen.queryByText(/서버 API 모드/i)).not.toBeInTheDocument()
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
    const button = screen.getByRole('button', { name: /프롬프트 전송/i })

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

    const button = screen.getByRole('button', { name: /프롬프트 전송/i })
    expect(button).toBeDisabled()
  })

  it('should enable button when prompt has content', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /프롬프트 전송/i })

    await user.type(textarea, '테스트')
    expect(button).not.toBeDisabled()
  })

  it('should show loading state correctly', () => {
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} isLoading={true} />)

    const button = screen.getByRole('button', { name: /프롬프트 전송/i })
    expect(button).toHaveAttribute('data-loading')
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
    const button = screen.getByRole('button', { name: /프롬프트 전송/i })

    // 공백만 입력
    await user.type(textarea, '   ')
    await user.click(button)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should trim whitespace when submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /프롬프트 전송/i })

    await user.type(textarea, '  테스트 프롬프트  ')
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith('테스트 프롬프트')
  })
})

/**
 * ChatInput 컴포넌트 테스트
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInput from '@/components/ChatInput';

describe('ChatInput', () => {
	const mockOnSubmit = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('렌더링되어야 함', () => {
		render(<ChatInput onSubmit={mockOnSubmit} />);

		const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
		expect(textarea).toBeInTheDocument();
	});

	it('메시지를 입력하고 전송해야 함', async () => {
		render(<ChatInput onSubmit={mockOnSubmit} />);

		const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
		const sendButton = screen.getByLabelText(/전송/i);

		fireEvent.change(textarea, { target: { value: '테스트 메시지' } });
		fireEvent.click(sendButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith('테스트 메시지');
		});
	});

	it('Enter 키로 전송해야 함', async () => {
		render(<ChatInput onSubmit={mockOnSubmit} />);

		const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);

		fireEvent.change(textarea, { target: { value: '테스트 메시지' } });
		fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter' });

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith('테스트 메시지');
		});
	});

	it('Shift+Enter는 줄바꿈이어야 함', () => {
		render(<ChatInput onSubmit={mockOnSubmit} />);

		const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);

		fireEvent.change(textarea, { target: { value: '테스트' } });
		fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });

		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	it('빈 메시지는 전송되지 않아야 함', () => {
		render(<ChatInput onSubmit={mockOnSubmit} />);

		const sendButton = screen.getByLabelText(/전송/i);
		expect(sendButton).toBeDisabled();
	});

	it('로딩 중에는 전송 버튼이 비활성화되어야 함', () => {
		render(<ChatInput onSubmit={mockOnSubmit} isLoading={true} />);

		const sendButton = screen.getByLabelText(/전송/i);
		expect(sendButton).toBeDisabled();
	});

	it('완료 상태일 때 적절한 플레이스홀더를 표시해야 함', () => {
		render(<ChatInput onSubmit={mockOnSubmit} isComplete={true} />);

		const textarea = screen.getByPlaceholderText(/문서 생성을 시작하려면/i);
		expect(textarea).toBeInTheDocument();
	});
});


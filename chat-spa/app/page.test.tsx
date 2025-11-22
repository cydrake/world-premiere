import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';
import { useChat } from '@/features/chat/hooks/useChat';

// Mock the useChat hook
jest.mock('@/features/chat/hooks/useChat');

// Mock the child components to avoid deep rendering and isolate the page test
jest.mock('@/features/chat/components/ChatLayout', () => ({
  ChatLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chat-layout">{children}</div>
  ),
}));

jest.mock('@/features/chat/components/ChatArea', () => ({
  ChatArea: ({ messages, isLoading }: any) => (
    <div data-testid="chat-area">
      <span data-testid="message-count">{messages.length}</span>
      <span data-testid="loading-state">{isLoading ? 'loading' : 'idle'}</span>
    </div>
  ),
}));

describe('Home Page', () => {
  const mockSendMessage = jest.fn();

  beforeEach(() => {
    (useChat as jest.Mock).mockReturnValue({
      messages: [],
      isLoading: false,
      sendMessage: mockSendMessage,
    });
  });

  it('renders ChatLayout and ChatArea', () => {
    render(<Home />);
    
    expect(screen.getByTestId('chat-layout')).toBeInTheDocument();
    expect(screen.getByTestId('chat-area')).toBeInTheDocument();
  });

  it('passes messages and loading state to ChatArea', () => {
    const mockMessages = [{ id: '1', role: 'user', content: 'test' }];
    (useChat as jest.Mock).mockReturnValue({
      messages: mockMessages,
      isLoading: true,
      sendMessage: mockSendMessage,
    });

    render(<Home />);
    
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
  });
});

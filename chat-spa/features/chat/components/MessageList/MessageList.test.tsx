import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageList } from './index';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('MessageList', () => {
  const mockMessages = [
    { id: '1', role: 'user' as const, content: 'Hello' },
    { id: '2', role: 'assistant' as const, content: 'Hi there' },
  ];

  it('renders messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<MessageList messages={mockMessages} isLoading={true} />);
    
    const loadingIndicator = document.querySelector('.animate-pulse');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('scrolls to bottom on new messages', () => {
    const { rerender } = render(<MessageList messages={[]} />);
    
    rerender(<MessageList messages={mockMessages} />);
    
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

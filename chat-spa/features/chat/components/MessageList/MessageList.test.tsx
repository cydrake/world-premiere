import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageList } from './index';

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

  it('renders streaming messages with cursor', () => {
    const streamingMessages = [
      ...mockMessages,
      {
        id: '3',
        role: 'assistant' as const,
        content: 'Streaming response',
        isStreaming: true,
        timestamp: new Date()
      }
    ];

    render(<MessageList messages={streamingMessages} />);

    expect(screen.getByText('Streaming response')).toBeInTheDocument();

    const cursors = document.querySelectorAll('.animate-pulse');
    expect(cursors.length).toBeGreaterThan(0);
  });

  it('scrolls to bottom on new messages', () => {
    const { rerender } = render(<MessageList messages={[]} />);
    
    rerender(<MessageList messages={mockMessages} />);
    
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('scrolls to bottom when loading state changes', () => {
    const { rerender } = render(<MessageList messages={mockMessages} isLoading={false} />);
    
    rerender(<MessageList messages={mockMessages} isLoading={true} />);
    
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

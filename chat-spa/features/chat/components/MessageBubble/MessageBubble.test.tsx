import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageBubble } from './index';

describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    const message = {
      id: '1',
      role: 'user' as const,
      content: 'Hello world',
      timestamp: new Date('2023-01-01T12:00:00')
    };
    render(<MessageBubble message={message} />);

    const messageText = screen.getByText('Hello world');
    expect(messageText).toBeInTheDocument();

    const container = messageText.closest('.flex.w-full');
    expect(container).toHaveClass('flex-row-reverse');
  });

  it('renders assistant message correctly', () => {
    const message = {
      id: '2',
      role: 'assistant' as const,
      content: 'I am a bot',
      timestamp: new Date('2023-01-01T12:00:00')
    };
    render(<MessageBubble message={message} />);

    const messageText = screen.getByText('I am a bot');
    expect(messageText).toBeInTheDocument();

    const container = messageText.closest('.flex.w-full');
    expect(container).toHaveClass('flex-row');
  });

  it('shows streaming cursor when message is streaming', () => {
    const message = {
      id: '3',
      role: 'assistant' as const,
      content: 'Streaming message',
      isStreaming: true,
      timestamp: new Date('2023-01-01T12:00:00')
    };
    render(<MessageBubble message={message} />);

    const messageText = screen.getByText('Streaming message');
    expect(messageText).toBeInTheDocument();

    const cursor = document.querySelector('.animate-pulse');
    expect(cursor).toBeInTheDocument();
  });

  it('does not show streaming cursor when message is not streaming', () => {
    const message = {
      id: '4',
      role: 'assistant' as const,
      content: 'Completed message',
      isStreaming: false,
      timestamp: new Date('2023-01-01T12:00:00')
    };
    render(<MessageBubble message={message} />);

    const messageText = screen.getByText('Completed message');
    expect(messageText).toBeInTheDocument();

    const cursor = document.querySelector('.animate-pulse');
    expect(cursor).not.toBeInTheDocument();
  });

  it('displays timestamp when provided', () => {
    const timestamp = new Date('2023-01-01T14:30:00');
    const message = {
      id: '5',
      role: 'assistant' as const,
      content: 'Message with timestamp',
      timestamp
    };
    render(<MessageBubble message={message} />);

    // Should display time in 24-hour format (HH:MM)
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('does not display timestamp when not provided', () => {
    const message = {
      id: '6',
      role: 'assistant' as const,
      content: 'Message without timestamp'
    };
    render(<MessageBubble message={message} />);

    const messageText = screen.getByText('Message without timestamp');
    expect(messageText).toBeInTheDocument();

    // Should not have timestamp
    expect(screen.queryByText(/\d{1,2}:\d{2}/)).not.toBeInTheDocument();
  });

  it('preserves whitespace in message content', () => {
    const message = {
      id: '7',
      role: 'assistant' as const,
      content: 'Message with\nmultiple lines and spaces',
      timestamp: new Date('2023-01-01T12:00:00')
    };
    render(<MessageBubble message={message} />);

    // Look for the specific content div with whitespace preservation
    const contentDiv = document.querySelector('.whitespace-pre-wrap');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveTextContent('Message with');
    expect(contentDiv).toHaveTextContent('multiple lines and spaces');
  });
});

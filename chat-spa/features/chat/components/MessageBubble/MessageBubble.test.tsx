import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageBubble } from './index';

describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    const message = { id: '1', role: 'user' as const, content: 'Hello world' };
    render(<MessageBubble message={message} />);
    
    const messageText = screen.getByText('Hello world');
    expect(messageText).toBeInTheDocument();
    
    const container = messageText.closest('.flex.w-full');
    expect(container).toHaveClass('flex-row-reverse');
  });

  it('renders assistant message correctly', () => {
    const message = { id: '2', role: 'assistant' as const, content: 'I am a bot' };
    render(<MessageBubble message={message} />);
    
    const messageText = screen.getByText('I am a bot');
    expect(messageText).toBeInTheDocument();
    
    const container = messageText.closest('.flex.w-full');
    expect(container).toHaveClass('flex-row');
  });
});

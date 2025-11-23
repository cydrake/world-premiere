import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatArea } from './index';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('ChatArea', () => {
  const mockMessages = [
    { id: '1', role: 'user' as const, content: 'Hello' },
    { id: '2', role: 'assistant' as const, content: 'Hi there' },
  ];

  it('renders empty state when no messages', () => {
    render(<ChatArea messages={[]} onSend={() => {}} />);
    
    expect(screen.getByText('Welcome to Teu Tale!')).toBeInTheDocument();
    expect(screen.getByText('I can tell you magical stories, answer curious questions, or just have a friendly chat. What shall we do today?')).toBeInTheDocument();
  });

  it('renders messages', () => {
    render(<ChatArea messages={mockMessages} onSend={() => {}} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to Teu Tale!')).not.toBeInTheDocument();
  });

  it('scrolls to bottom on new messages', () => {
    const { rerender } = render(<ChatArea messages={[]} onSend={() => {}} />);
    
    rerender(<ChatArea messages={mockMessages} onSend={() => {}} />);
    
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatLayout } from './index';

jest.mock('../ChatSidebar', () => ({
  ChatSidebar: () => <div data-testid="chat-sidebar">Sidebar</div>,
}));

describe('ChatLayout', () => {
  it('renders sidebar', () => {
    render(
      <ChatLayout>
        <div>Content</div>
      </ChatLayout>
    );
    
    expect(screen.getByTestId('chat-sidebar')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ChatLayout>
        <div data-testid="child-content">Child Content</div>
      </ChatLayout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});

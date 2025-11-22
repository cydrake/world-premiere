import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyChatState } from './index';

describe('EmptyChatState', () => {
  it('renders correctly', () => {
    render(<EmptyChatState />);
    
    expect(screen.getByText('Welcome to Teu Tale!')).toBeInTheDocument();
    expect(screen.getByText('I can tell you magical stories, answer curious questions, or just have a friendly chat. What shall we do today?')).toBeInTheDocument();
  });
});

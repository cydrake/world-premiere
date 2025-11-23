import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatSidebar } from './index';

describe('ChatSidebar', () => {
  it('renders sidebar items when expanded', () => {
    render(<ChatSidebar />);
    
    const toggleButton = screen.getByRole('button', { name: /✨/ });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Start New Story')).toBeInTheDocument();
    expect(screen.getByText('Past Stories')).toBeInTheDocument();
    expect(screen.getByText('Magic Settings')).toBeInTheDocument();
    expect(screen.getByText('Your Adventures')).toBeInTheDocument();
  });

  it('renders previous conversations when expanded', () => {
    render(<ChatSidebar />);
    
    const toggleButton = screen.getByRole('button', { name: /✨/ });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('The Magical Forest 1')).toBeInTheDocument();
    expect(screen.getByText('The Magical Forest 2')).toBeInTheDocument();
    expect(screen.getByText('The Magical Forest 3')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ChatInput } from './index';

describe('ChatInput', () => {
  it('renders input and button', () => {
    render(<ChatInput onSend={() => {}} />);
    
    expect(screen.getByPlaceholderText('Write your wish here...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onSend when button is clicked', async () => {
    const handleSend = jest.fn();
    render(<ChatInput onSend={handleSend} />);
    
    const input = screen.getByPlaceholderText('Write your wish here...');
    const button = screen.getByRole('button');

    await userEvent.type(input, 'Hello');
    await userEvent.click(button);

    expect(handleSend).toHaveBeenCalledWith('Hello');
    expect(input).toHaveValue('');
  });

  it('calls onSend when Enter is pressed', async () => {
    const handleSend = jest.fn();
    render(<ChatInput onSend={handleSend} />);
    
    const input = screen.getByPlaceholderText('Write your wish here...');

    await userEvent.type(input, 'Hello{enter}');

    expect(handleSend).toHaveBeenCalledWith('Hello');
    expect(input).toHaveValue('');
  });

  it('does not send empty message', async () => {
    const handleSend = jest.fn();
    render(<ChatInput onSend={handleSend} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<ChatInput onSend={() => {}} disabled={true} />);
    
    expect(screen.getByPlaceholderText('Write your wish here...')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

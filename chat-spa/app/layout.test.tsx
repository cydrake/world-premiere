import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from './layout';

jest.mock('next/font/google', () => ({
  Varela_Round: () => ({
    className: 'mock-font-class',
  }),
}));

describe('RootLayout', () => {
  it('renders children and applies font class', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});

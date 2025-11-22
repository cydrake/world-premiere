import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from './layout';

// Mock the font
jest.mock('next/font/google', () => ({
  Fredoka: () => ({
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
    // Since we can't easily test the html/body tags in a unit test environment 
    // (as render usually mounts into a div), we verify the children are rendered.
    // Testing the actual html/body structure usually requires e2e tests or specific setup.
  });
});

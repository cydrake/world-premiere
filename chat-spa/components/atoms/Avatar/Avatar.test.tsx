import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar } from './index';
import { Mail } from 'lucide-react';

describe('Avatar Atom', () => {
  it('renders default bot variant correctly', () => {
    const { container } = render(<Avatar />);
    // Check for bot styling
    expect(container.firstChild).toHaveClass('bg-indigo-100');
    expect(container.firstChild).toHaveClass('text-indigo-600');
  });

  it('renders user variant correctly', () => {
    const { container } = render(<Avatar variant="user" />);
    // Check for user styling
    expect(container.firstChild).toHaveClass('bg-orange-400');
    expect(container.firstChild).toHaveClass('text-white');
  });

  it('renders custom icon when provided', () => {
    const { container } = render(<Avatar icon={Mail} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    // We can't easily check which icon it is without checking internal SVG paths, 
    // but presence of SVG confirms icon rendering.
  });

  it('merges custom classes', () => {
    const { container } = render(<Avatar className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner.jsx'

describe('LoadingSpinner', () => {
  it('should render with default medium size', () => {
    const { container } = render(<LoadingSpinner />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('w-8', 'h-8')
  })

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('w-4', 'h-4')
  })

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('w-12', 'h-12')
  })

  it('should have spinning animation', () => {
    const { container } = render(<LoadingSpinner />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('animate-spin')
  })

  it('should have correct color', () => {
    const { container } = render(<LoadingSpinner />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-blue-600')
  })
})

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingFallback } from './LoadingFallback'

describe('LoadingFallback', () => {
  it('renders a container with minimum height', () => {
    const { container } = render(<LoadingFallback />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toContain('min-h-[50vh]')
  })

  it('renders without crashing when className is provided', () => {
    const { container } = render(<LoadingFallback className="extra-class" />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toContain('extra-class')
  })
})
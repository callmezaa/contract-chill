import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders text content', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders as a <span> element by default', () => {
    render(<Badge>Tag</Badge>)
    const badge = screen.getByText('Tag')
    expect(badge.tagName).toBe('SPAN')
  })

  it('applies default variant class', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default').className).toContain('bg-primary')
  })

  it('applies secondary variant class', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary').className).toContain('bg-secondary')
  })

  it('applies destructive variant class', () => {
    render(<Badge variant="destructive">Danger</Badge>)
    expect(screen.getByText('Danger').className).toContain('text-destructive')
  })

  it('applies outline variant class', () => {
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline').className).toContain('border-border')
  })
})
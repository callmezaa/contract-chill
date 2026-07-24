import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card composition', () => {
  it('renders Card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>Main content here</CardContent>
        <CardFooter>Footer area</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description text')).toBeInTheDocument()
    expect(screen.getByText('Main content here')).toBeInTheDocument()
    expect(screen.getByText('Footer area')).toBeInTheDocument()
  })

  it('Card has correct data-slot attribute', () => {
    const { container } = render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveAttribute('data-slot', 'card')
  })

  it('CardHeader, Content, Footer are div elements', () => {
    render(
      <Card>
        <CardHeader><span>Header</span></CardHeader>
        <CardContent><span>Content</span></CardContent>
        <CardFooter><span>Footer</span></CardFooter>
      </Card>
    )

    expect(screen.getByText('Header').parentElement?.tagName).toBe('DIV')
    expect(screen.getByText('Content').parentElement?.tagName).toBe('DIV')
    expect(screen.getByText('Footer').parentElement?.tagName).toBe('DIV')
  })
})
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn()', () => {
  it('merges class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes via array', () => {
    const result = cn('base', ['conditional', 'class'])
    expect(result).toContain('base')
    expect(result).toContain('conditional')
    expect(result).toContain('class')
  })

  it('handles conditional classes via object', () => {
    const result = cn('base', { active: true, hidden: false })
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('hidden')
  })

  it('resolves Tailwind conflicts (later wins)', () => {
    const result = cn('px-4', 'px-2')
    expect(result).toBe('px-2')
  })

  it('handles undefined and null values gracefully', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
})
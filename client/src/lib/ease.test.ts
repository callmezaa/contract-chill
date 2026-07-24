import { describe, it, expect } from 'vitest'
import {
  EASE_OUT,
  EASE_IN_OUT,
  EASE_DRAWER,
  EASE_OUT_CSS,
  SPRING_PRESS,
  SPRING_SWAP,
  SPRING_PANEL,
  SPRING_LAYOUT,
  SPRING_MOUSE,
} from './ease'

describe('Easing constants', () => {
  it('EASE_OUT is a cubic bezier tuple', () => {
    expect(EASE_OUT).toEqual([0.16, 1, 0.3, 1])
    expect(EASE_OUT).toHaveLength(4)
  })

  it('EASE_IN_OUT is a cubic bezier tuple', () => {
    expect(EASE_IN_OUT).toEqual([0.77, 0, 0.175, 1])
    expect(EASE_IN_OUT).toHaveLength(4)
  })

  it('EASE_DRAWER is a cubic bezier tuple', () => {
    expect(EASE_DRAWER).toEqual([0.32, 0.72, 0, 1])
    expect(EASE_DRAWER).toHaveLength(4)
  })

  it('EASE_OUT_CSS is a CSS string version', () => {
    expect(EASE_OUT_CSS).toBe('cubic-bezier(0.16, 1, 0.3, 1)')
  })
})

describe('Spring constants', () => {
  const expectedSpringKeys = ['type', 'stiffness', 'damping', 'mass'] as const

  it('SPRING_PRESS has correct physics', () => {
    expect(SPRING_PRESS).toMatchObject({
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 0.6,
    })
    expect(Object.keys(SPRING_PRESS).sort()).toEqual(
      [...expectedSpringKeys].sort()
    )
  })

  it('SPRING_SWAP has correct physics', () => {
    expect(SPRING_SWAP).toMatchObject({
      type: 'spring',
      stiffness: 460,
      damping: 30,
      mass: 0.55,
    })
  })

  it('SPRING_PANEL has correct physics', () => {
    expect(SPRING_PANEL).toMatchObject({
      type: 'spring',
      stiffness: 420,
      damping: 40,
      mass: 0.5,
    })
  })

  it('SPRING_LAYOUT has correct physics', () => {
    expect(SPRING_LAYOUT).toMatchObject({
      type: 'spring',
      stiffness: 360,
      damping: 32,
      mass: 0.6,
    })
  })

  it('SPRING_MOUSE has correct physics (no type field)', () => {
    expect(SPRING_MOUSE).toMatchObject({
      stiffness: 200,
      damping: 15,
      mass: 0.3,
    })
    expect(SPRING_MOUSE).not.toHaveProperty('type')
  })
})
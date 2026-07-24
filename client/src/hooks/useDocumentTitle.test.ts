import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDocumentTitle } from './useDocumentTitle'

describe('useDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'ContractChill'
  })

  it('sets the document title', () => {
    renderHook(() => useDocumentTitle('Dashboard'))
    expect(document.title).toBe('Dashboard')
  })

  it('restores previous title on unmount by default', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Dashboard'))
    expect(document.title).toBe('Dashboard')

    unmount()
    expect(document.title).toBe('ContractChill')
  })

  it('retains the title on unmount when retainOnUnmount is true', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Dashboard', true))
    expect(document.title).toBe('Dashboard')

    unmount()
    expect(document.title).toBe('Dashboard')
  })

  it('updates title when the value changes', () => {
    const { rerender } = renderHook(
      ({ title }: { title: string }) => useDocumentTitle(title),
      { initialProps: { title: 'Dashboard' } }
    )
    expect(document.title).toBe('Dashboard')

    rerender({ title: 'Settings' })
    expect(document.title).toBe('Settings')
  })
})
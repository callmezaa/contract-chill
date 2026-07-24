import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeContext'

function ThemeConsumer() {
  const { theme, setTheme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>System</button>
    </div>
  )
}

function createMockStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  )
}

describe('ThemeContext', () => {
  let mockStorage: ReturnType<typeof createMockStorage>

  beforeEach(() => {
    mockStorage = createMockStorage()
    vi.stubGlobal('localStorage', mockStorage)

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
    document.documentElement.classList.remove('light', 'dark')
  })

  it('defaults to system theme when no localStorage value exists', () => {
    renderWithTheme()
    expect(screen.getByTestId('theme-value').textContent).toBe('system')
  })

  it('reads theme from localStorage on mount', () => {
    mockStorage.getItem.mockReturnValue('dark')
    renderWithTheme()
    expect(screen.getByTestId('theme-value').textContent).toBe('dark')
  })

  it('toggles theme from system to dark', async () => {
    const user = userEvent.setup()
    renderWithTheme()

    await user.click(screen.getByTestId('toggle-btn'))
    expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('toggles theme from dark to light', async () => {
    mockStorage.getItem.mockReturnValue('dark')
    const user = userEvent.setup()

    renderWithTheme()
    await user.click(screen.getByTestId('toggle-btn'))
    expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('sets theme to light via setTheme', async () => {
    const user = userEvent.setup()
    renderWithTheme()

    await user.click(screen.getByTestId('set-light'))
    expect(screen.getByTestId('theme-value').textContent).toBe('light')
    expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('sets theme to dark via setTheme', async () => {
    const user = userEvent.setup()
    renderWithTheme()

    await user.click(screen.getByTestId('set-dark'))
    expect(screen.getByTestId('theme-value').textContent).toBe('dark')
    expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('applies theme class to document element', async () => {
    const user = userEvent.setup()
    renderWithTheme()

    await user.click(screen.getByTestId('set-dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('throws error when useTheme is used outside ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<ThemeConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    )

    consoleSpy.mockRestore()
  })
})
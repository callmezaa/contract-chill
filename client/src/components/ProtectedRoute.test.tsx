import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'

function renderProtectedRoute(route = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={route} element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset()
  })

  it('shows loading spinner when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
    } as ReturnType<typeof useAuth>)

    const { container } = renderProtectedRoute()
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: '123', email: 'test@test.com' },
      loading: false,
    } as unknown as ReturnType<typeof useAuth>)

    renderProtectedRoute()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to "/" when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    } as ReturnType<typeof useAuth>)

    renderProtectedRoute()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
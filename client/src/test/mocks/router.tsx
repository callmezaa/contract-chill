import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  route?: string
}

export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], route, ...renderOptions }: RenderWithRouterOptions = {}
) {
  if (route) {
    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={route} element={children} />
          </Routes>
        </MemoryRouter>
      )
    }
    return render(ui, { wrapper: Wrapper, ...renderOptions })
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
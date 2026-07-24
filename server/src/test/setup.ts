import { vi, afterEach } from 'vitest'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.PORT = '0'
process.env.GEMINI_API_KEY = 'test-key'

afterEach(() => {
  vi.clearAllMocks()
})
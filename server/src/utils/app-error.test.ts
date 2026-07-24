import { describe, it, expect } from 'vitest'
import { AppError } from './app-error'

describe('AppError', () => {
  it('creates an error with status code and message', () => {
    const err = new AppError(404, 'Not Found')
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('Not Found')
    expect(err.name).toBe('AppError')
    expect(err).toBeInstanceOf(Error)
  })

  it('creates an error with optional code', () => {
    const err = new AppError(429, 'Too Many Requests', 'RATE_LIMIT')
    expect(err.code).toBe('RATE_LIMIT')
  })

  it('creates different status codes correctly', () => {
    const tests = [
      { status: 400, message: 'Bad Request' },
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' },
      { status: 500, message: 'Internal Error' },
    ]

    tests.forEach(({ status, message }) => {
      const err = new AppError(status, message)
      expect(err.statusCode).toBe(status)
      expect(err.message).toBe(message)
    })
  })

  it('maintains stack trace', () => {
    const err = new AppError(500, 'Error')
    expect(err.stack).toBeDefined()
    expect(err.stack).toContain('AppError')
  })
})
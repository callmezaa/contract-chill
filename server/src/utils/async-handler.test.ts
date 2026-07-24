import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { asyncHandler } from './async-handler'

describe('asyncHandler', () => {
  it('calls next() with error when async function rejects', async () => {
    const req = {} as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    const error = new Error('Async error')
    const asyncFn = async () => { throw error }

    const wrapped = asyncHandler(asyncFn)
    await wrapped(req, res, next)

    expect(next).toHaveBeenCalledWith(error)
  })

  it('passes through when async function resolves', async () => {
    const req = {} as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    const asyncFn = vi.fn().mockResolvedValue(undefined)

    const wrapped = asyncHandler(asyncFn)
    await wrapped(req, res, next)

    expect(asyncFn).toHaveBeenCalledWith(req, res, next)
    expect(next).not.toHaveBeenCalled()
  })
})
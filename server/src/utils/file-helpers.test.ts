import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { ensureUploadDir, saveFile, deleteFile } from './file-helpers'

describe('file-helpers', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-chill-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('ensureUploadDir', () => {
    it('creates directory if it does not exist', () => {
      const dir = path.join(tmpDir, 'new-uploads')
      expect(fs.existsSync(dir)).toBe(false)

      ensureUploadDir(dir)

      expect(fs.existsSync(dir)).toBe(true)
      expect(fs.statSync(dir).isDirectory()).toBe(true)
    })

    it('does not throw if directory already exists', () => {
      ensureUploadDir(tmpDir)
      expect(() => ensureUploadDir(tmpDir)).not.toThrow()
    })
  })

  describe('saveFile', () => {
    it('saves buffer to file and returns fileName and filePath', () => {
      const buffer = Buffer.from('test content')
      const result = saveFile(buffer, 'test.txt', tmpDir)

      expect(result.fileName).toMatch(/^[0-9a-f-]+\.txt$/)
      expect(result.filePath).toBe(path.join(tmpDir, result.fileName))
      expect(fs.existsSync(result.filePath)).toBe(true)
      expect(fs.readFileSync(result.filePath, 'utf-8')).toBe('test content')
    })

    it('handles files without extension', () => {
      const buffer = Buffer.from('no extension')
      const result = saveFile(buffer, 'testfile', tmpDir)

      expect(result.fileName).toMatch(/\.bin$/)
    })

    it('creates uploads directory if missing', () => {
      const nestedDir = path.join(tmpDir, 'deep', 'nested')
      const buffer = Buffer.from('content')

      saveFile(buffer, 'nested.txt', nestedDir)

      expect(fs.existsSync(nestedDir)).toBe(true)
      const files = fs.readdirSync(nestedDir)
      expect(files).toHaveLength(1)
      expect(files[0]).toMatch(/\.txt$/)
    })
  })

  describe('deleteFile', () => {
    it('deletes an existing file', () => {
      const filePath = path.join(tmpDir, 'to-delete.txt')
      fs.writeFileSync(filePath, 'delete me')

      deleteFile(filePath)

      expect(fs.existsSync(filePath)).toBe(false)
    })

    it('does not throw if file does not exist', () => {
      const nonExistent = path.join(tmpDir, 'ghost.txt')
      expect(() => deleteFile(nonExistent)).not.toThrow()
    })
  })
})
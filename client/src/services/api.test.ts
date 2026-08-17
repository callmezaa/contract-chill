import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upload as blobUpload } from '@vercel/blob/client'

const mockAxiosInstance = {
  post: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

const mockBlobUrl = 'https://store.public.blob.vercel-storage.com/contract.pdf'

vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(async () => ({ url: mockBlobUrl })),
}))

const { analyzeContract, uploadProfilePhoto, generateNegotiationScript, generateContractDraft } = await import('./api')

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeContract', () => {
    it('uploads the file to Blob, then sends the blob URL to /analyze', async () => {
      const file = new File(['contract content'], 'contract.pdf', { type: 'application/pdf' })
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { summary: 'Test summary', redFlags: [], fileUrl: mockBlobUrl },
      })

      const result = await analyzeContract(file, 'Chill Friend')

      expect(blobUpload).toHaveBeenCalledWith(
        'contract.pdf',
        file,
        expect.objectContaining({
          handleUploadUrl: expect.stringContaining('/upload-token'),
          clientPayload: JSON.stringify({ type: 'contract' }),
        })
      )
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/analyze', {
        fileUrl: mockBlobUrl,
        fileName: 'contract.pdf',
        fileType: 'application/pdf',
        persona: 'Chill Friend',
      })
      expect(result.summary).toBe('Test summary')
    })

    it('propagates API errors', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network Error'))

      await expect(analyzeContract(file, 'Angry Lawyer')).rejects.toThrow('Network Error')
    })
  })

  describe('uploadProfilePhoto', () => {
    it('uploads a photo to Blob and returns its URL', async () => {
      const file = new File(['photo'], 'avatar.png', { type: 'image/png' })

      const url = await uploadProfilePhoto(file)

      expect(blobUpload).toHaveBeenCalledWith(
        'avatar.png',
        file,
        expect.objectContaining({
          clientPayload: JSON.stringify({ type: 'photo' }),
        })
      )
      expect(url).toBe(mockBlobUrl)
    })
  })

  describe('generateNegotiationScript', () => {
    it('sends clause, explanation, persona, and tone', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { script: 'Suggested script...' },
      })

      const result = await generateNegotiationScript(
        'Clause 5', 'This is risky', 'Corporate Mentor', 'Friendly'
      )

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/generate-script', {
        clause: 'Clause 5',
        explanation: 'This is risky',
        persona: 'Corporate Mentor',
        tone: 'Friendly',
      })
      expect(result).toBe('Suggested script...')
    })

    it('works without tone parameter', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { script: 'Default tone script' },
      })

      const result = await generateNegotiationScript(
        'Clause 2', 'Standard issue', 'Freelancer Senior'
      )

      expect(mockAxiosInstance.post).toHaveBeenCalled()
      expect(result).toBe('Default tone script')
    })
  })

  describe('generateContractDraft', () => {
    it('sends contract generation parameters', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { draft: '# Contract Draft\n\n...' },
      })

      const result = await generateContractDraft({
        clientName: 'Acme Corp',
        myName: 'John Doe',
        projectValue: '$5000',
        contractType: 'Freelance Services Agreement',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/generate-contract', {
        clientName: 'Acme Corp',
        myName: 'John Doe',
        projectValue: '$5000',
        contractType: 'Freelance Services Agreement',
      })
      expect(result).toBe('# Contract Draft\n\n...')
    })
  })
})

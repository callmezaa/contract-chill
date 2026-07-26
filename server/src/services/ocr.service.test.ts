import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(),
  },
}));

import { ocrPDF } from './ocr.service';
import Tesseract from 'tesseract.js';

const mockRecognize = Tesseract.recognize as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ocrPDF', () => {
  it('returns text when OCR succeeds', async () => {
    mockRecognize.mockResolvedValue({
      data: { text: 'This is a sample contract with some legal terms and conditions.' },
    });

    const result = await ocrPDF(Buffer.from('fake-pdf-content'));
    expect(result).toBe('This is a sample contract with some legal terms and conditions.');
    expect(mockRecognize).toHaveBeenCalledWith(
      expect.any(Buffer),
      'ind+eng',
    );
  });

  it('trims whitespace from extracted text', async () => {
    mockRecognize.mockResolvedValue({
      data: { text: '  \n  Contract text with whitespace  \n  ' },
    });

    const result = await ocrPDF(Buffer.from('fake'));
    expect(result).toBe('Contract text with whitespace');
  });

  it('throws on OCR timeout', async () => {
    mockRecognize.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 200_000))
    );

    await expect(ocrPDF(Buffer.from('fake'))).rejects.toThrow('OCR_TIMEOUT');
  }, 130_000);

  it('throws on Tesseract error', async () => {
    mockRecognize.mockRejectedValue(new Error('Tesseract crashed'));

    await expect(ocrPDF(Buffer.from('fake'))).rejects.toThrow('Tesseract crashed');
  });
});

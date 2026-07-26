import Tesseract from 'tesseract.js';

const OCR_TIMEOUT_MS = 120_000;

export async function ocrPDF(buffer: Buffer): Promise<string> {
  const result = await Promise.race([
    Tesseract.recognize(buffer, 'ind+eng'),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('OCR_TIMEOUT')), OCR_TIMEOUT_MS)
    ),
  ]);

  const text = result.data.text.trim();
  return text;
}

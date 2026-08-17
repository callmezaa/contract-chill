import { ocrPDF } from '../services/ocr.service';

const pdf = require('pdf-parse');

export const MIN_TEXT_LENGTH = 50;

/**
 * Extracts readable text from a document buffer.
 * - PDFs are parsed with pdf-parse, falling back to OCR for scanned/encrypted pages.
 * - Any other content type is read as UTF-8 text.
 */
export async function extractTextFromBuffer(buffer: Buffer, contentType?: string): Promise<string> {
  const isPdf = !contentType || contentType.toLowerCase().includes('pdf');

  if (isPdf) {
    const data = await pdf(buffer);
    const text = data.text || '';
    if (text.trim().length >= MIN_TEXT_LENGTH) return text;
    return ocrPDF(buffer);
  }

  return buffer.toString('utf-8');
}

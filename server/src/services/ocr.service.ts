import Tesseract from 'tesseract.js';

const OCR_TIMEOUT_MS = 120_000;

export async function ocrPDF(buffer: Buffer): Promise<string> {
  const start = Date.now();
  console.log('[OCR] Processing PDF...');

  const result = await Promise.race([
    Tesseract.recognize(buffer, 'ind+eng', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          console.log(`[OCR] ${Math.round(info.progress * 100)}%`);
        }
      },
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('OCR_TIMEOUT')), OCR_TIMEOUT_MS)
    ),
  ]);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const text = result.data.text.trim();
  console.log(`[OCR] Complete in ${elapsed}s — ${text.length} chars`);
  return text;
}

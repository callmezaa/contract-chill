# OCR PDF — Tesseract.js Integration for Scanned PDFs

**Status:** Approved design
**Date:** 2026-07-24
**Goal:** Add Tesseract.js OCR fallback when `pdf-parse` fails to extract text from scanned/image-based PDFs

---

## Problem

`pdf-parse` (server-side PDF text extractor) only works with text-based PDFs. Scanned PDFs — documents that are essentially images embedded in a PDF container — return empty or near-empty text (`< 50 chars`). Currently the server returns an error telling users to upload text-based PDFs instead.

## Solution

Add a hybrid extraction flow: try `pdf-parse` first, and if the extracted text is below the threshold (`< 50 chars`), fall back to Tesseract.js OCR which processes the PDF page images and extracts text at the pixel level.

## Architecture

### Flow diagram

```
Client upload PDF (multipart/form-data)
  ↓
multer memory buffer
  ↓
pdf-parse extract text
  ↓
text ≥ 50 chars? ──✅──→ save file → Gemini analysis (existing, unchanged)
  ↓ no
try Tesseract.js OCR (ind+eng)
  ↓
OCR text ≥ 50 chars? ──✅──→ save file → Gemini analysis
  ↓ no
return error: "Dokumen tidak terbaca setelah OCR"
```

### New file: `server/src/services/ocr.service.ts`

Single exported function:

```typescript
export async function ocrPDF(buffer: Buffer): Promise<string>
```

**Behavior:**
1. Log start: `console.log('[OCR] Processing PDF...')`
2. Call `Tesseract.recognize(buffer, 'ind+eng')` — Tesseract.js v5+ directly accepts PDF buffers, internally rendering pages via pdf.js
3. Set 120-second timeout via `Promise.race` to prevent hanging
4. Log completion with duration and character count
5. Return `data.text`
6. On error: throw with descriptive message

**Language choice:** `'ind+eng'` — Indonesian contracts typically mix Indonesian and English. Tesseract.js ships both language packs via WASM distribution.

**Timeout implementation:**

```typescript
const result = await Promise.race([
  Tesseract.recognize(buffer, 'ind+eng', {
    logger: (info) => {
      if (info.status === 'recognizing text') {
        console.log(`[OCR] ${Math.round(info.progress * 100)}%`);
      }
    },
  }),
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('OCR_TIMEOUT')), 120_000)
  ),
]);
```

### Modified file: `server/src/controllers/analysis.controller.ts`

Current code (lines 32-34):
```typescript
if (!text || text.trim().length < 50) {
  throw new AppError(400, 'Teks dokumen terlalu sedikit atau tidak terbaca...');
}
```

New code:
```typescript
if (!text || text.trim().length < 50) {
  try {
    text = await ocrPDF(file.buffer);
  } catch (ocrErr) {
    console.error('[OCR] Failed:', ocrErr);
    const message = ocrErr instanceof Error && ocrErr.message === 'OCR_TIMEOUT'
      ? 'OCR gagal: waktu pemrosesan habis. Coba dokumen dengan lebih sedikit halaman.'
      : 'Gagal memproses dokumen dengan OCR. Silakan coba lagi.';
    throw new AppError(400, message);
  }
  if (!text || text.trim().length < 50) {
    throw new AppError(400, 'Dokumen tidak terbaca setelah OCR. Pastikan teks dalam dokumen cukup jelas.');
  }
}
```

### Dependencies

- `tesseract.js` v5.x — single npm dependency. Ships WASM binaries + language data.

Package.json:
```json
"dependencies": {
  "tesseract.js": "^5.1.0"
}
```

### What stays unchanged

| File | Reason |
|------|--------|
| `client/src/services/api.ts` | Upload API call identical |
| `server/src/routes/analysis.routes.ts` | Route + multer config unchanged |
| `server/src/services/gemini.service.ts` | Receives text identically |
| `server/src/utils/file-helpers.ts` | Saves file after extraction |
| `client/src/pages/Dashboard.tsx` | Upload UI unchanged |

### Error messages

| Scenario | Message |
|----------|---------|
| pdf-parse error (corrupt/encrypted) | `Gagal membaca dokumen. Pastikan PDF Anda tidak dikunci dengan password (terenkripsi) atau rusak.` (existing) |
| pdf-parse empty, OCR empty | `Dokumen tidak terbaca setelah OCR. Pastikan teks dalam dokumen cukup jelas.` (new) |
| OCR timeout (>120s) | `OCR gagal: waktu pemrosesan habis. Coba dokumen dengan lebih sedikit halaman.` (new) |
| OCR generic error | `Gagal memproses dokumen dengan OCR. Silakan coba lagi.` (new) |

### Performance

- Tesseract.js uses Web Workers (worker_threads) internally — CPU-bound work does not block the Node.js event loop
- Language packs (`ind.traineddata`, `eng.traineddata`) downloaded on first use from Tesseract CDN (~2MB each, cached)
- For typical contract PDFs (1-10 pages), OCR takes ~5-30 seconds
- Rate limiter `analyzeLimiter` (15 req / 15 min per IP) already in place
- 120-second timeout prevents hanging indefinitely

### Out of scope (YAGNI)

- Client-side preprocessing (deskew, rotation, denoising)
- Multi-language auto-detection (fixed to `ind+eng`)
- Firebase Storage for uploads
- PDF preview improvements in Analyzer page
- Parallel page processing via Tesseract scheduler
- Local caching of OCR language data to avoid CDN download on first use
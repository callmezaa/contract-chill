import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function ensureUploadDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function saveFile(
  buffer: Buffer,
  originalName: string,
  uploadsDir: string
): { fileName: string; filePath: string } {
  ensureUploadDir(uploadsDir);
  const ext = path.extname(originalName) || '.bin';
  const fileName = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return { fileName, filePath };
}

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Silently ignore — file may already be gone
  }
}

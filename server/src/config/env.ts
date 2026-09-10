import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  // Required for Vercel Blob client uploads (handleUpload). Kept optional in
  // schema so `test` env doesn't fail; the /upload-token route validates it
  // explicitly and returns a clear 500 instead of the vague
  // "Failed to retrieve the client token" on the frontend.
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);

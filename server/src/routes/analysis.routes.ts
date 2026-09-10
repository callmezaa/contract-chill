import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { AnalysisController } from '../controllers/analysis.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Rate limiter: Max 5 analysis requests per hour per IP (Free Tier protection)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: 'Too many contracts analyzed from this IP. Please try again after an hour or upgrade to Pro.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for chat/script/token requests (less strict, e.g., 20 per hour)
const actionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    error: 'Too many AI interactions from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Issues a short-lived upload token so the browser can upload files
// directly to Vercel Blob (bypasses the 4.5MB serverless function body limit).
router.post('/upload-token', requireAuth, actionLimiter, asyncHandler(async (req, res) => {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error('BLOB_READ_WRITE_TOKEN is not configured. Add it to server/.env locally or to the Vercel project environment variables.');
    return res.status(500).json({
      error: 'File upload is not configured (missing BLOB_READ_WRITE_TOKEN). Please contact support or check server env.',
    });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      token: blobToken,
    onBeforeGenerateToken: async (_pathname, clientPayload) => {
      let type: string | undefined;
      try {
        type = JSON.parse(clientPayload || '{}')?.type;
      } catch {
        type = undefined;
      }
      const isPhoto = type === 'photo';
      return {
        allowedContentTypes: isPhoto
          ? ['image/jpeg', 'image/png', 'image/webp']
          : ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maximumSizeInBytes: isPhoto ? 2 * 1024 * 1024 : 10 * 1024 * 1024,
        addRandomSuffix: true,
      };
    },
    });
    res.json(jsonResponse);
  } catch (err) {
    console.error('handleUpload failed:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to generate upload token',
    });
  }
}));

router.post('/analyze', requireAuth, analyzeLimiter, asyncHandler(AnalysisController.analyze));
router.post('/chat', requireAuth, actionLimiter, asyncHandler(AnalysisController.chat));
router.post('/generate-script', requireAuth, actionLimiter, asyncHandler(AnalysisController.generateScript));
router.post('/generate-contract', requireAuth, actionLimiter, asyncHandler(AnalysisController.generateContract));

export default router;

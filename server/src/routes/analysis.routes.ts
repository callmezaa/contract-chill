import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AnalysisController } from '../controllers/analysis.controller';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Set file upload limit to 10MB to prevent Out Of Memory (OOM) / DoS attacks
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Profile photo upload endpoint (bypasses Firebase Storage quota)
const photoUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB for profile photos
});
router.post('/upload-photo', requireAuth, photoUpload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const authReq = req as AuthenticatedRequest;
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(req.file.originalname) || '.jpg';
    const safeName = `profile_${authReq.user?.uid}_${crypto.randomUUID()}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, safeName), req.file.buffer);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ photoURL: `${baseUrl}/uploads/${safeName}` });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

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

// Rate limiter for chat/script (less strict, e.g., 20 per hour)
const actionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    error: 'Too many AI interactions from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes are now protected by requireAuth
router.post('/analyze', requireAuth, analyzeLimiter, upload.single('contract'), (req, res, next) => {
  console.log('API /analyze hit!');
  next();
}, asyncHandler(AnalysisController.analyze));

router.post('/chat', requireAuth, actionLimiter, asyncHandler(AnalysisController.chat));
router.post('/generate-script', requireAuth, actionLimiter, asyncHandler(AnalysisController.generateScript));
router.post('/generate-contract', requireAuth, actionLimiter, asyncHandler(AnalysisController.generateContract));

export default router;

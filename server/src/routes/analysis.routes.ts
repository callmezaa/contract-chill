import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { AnalysisController } from '../controllers/analysis.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Set file upload limit to 10MB to prevent Out Of Memory (OOM) / DoS attacks
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
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
}, AnalysisController.analyze);

router.post('/chat', requireAuth, actionLimiter, AnalysisController.chat);
router.post('/generate-script', requireAuth, actionLimiter, AnalysisController.generateScript);
router.post('/generate-contract', requireAuth, actionLimiter, AnalysisController.generateContract);

export default router;

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { MulterError } from 'multer';
import path from 'path';
import fs from 'fs';

import { env } from './config/env';
import analysisRoutes from './routes/analysis.routes';
import { AppError } from './utils/app-error';

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Trust the first proxy hop so req.ip reflects the real client IP
// behind Render / Railway / similar reverse proxies (needed for per-IP rate limiting).
app.set('trust proxy', 1);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);
app.use(cors());
app.use(express.json());

// Health check (also used by Render health checks and keep-awake pings)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Serve uploaded files (bypasses Firebase Storage quota)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api', analysisRoutes);

// Serve Static Frontend Assets in Production
if (env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Contract-Chill API is running in development mode' });
  });
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  // Multer errors (e.g. file exceeds the size limit) -> 413 Payload Too Large
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Please upload a smaller file.'
        : 'File upload failed.';
    return res.status(413).json({
      success: false,
      error: message,
      code: err.code,
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

app.listen(env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
});

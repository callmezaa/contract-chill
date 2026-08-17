import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

import { env } from './config/env';
import analysisRoutes from './routes/analysis.routes';
import { AppError } from './utils/app-error';

const app = express();

// Trust the first proxy hop so req.ip reflects the real client IP
// behind Render / Railway / Vercel / similar reverse proxies (needed for per-IP rate limiting).
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

// Health check (also used by platform health checks and keep-awake pings)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api', analysisRoutes);

// Serve Static Frontend Assets in Production (only when the build output exists,
// e.g. the Docker/Railway deployment. Skipped on serverless platforms like Vercel).
if (env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.use((req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }
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

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

export default app;

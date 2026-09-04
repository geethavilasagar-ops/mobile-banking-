import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { ENV } from './config/env';
import router from './routes';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security & Logging
app.use(helmet());
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined')); // Request logging
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ENV.ALLOWED_ORIGINS.includes(origin) || ENV.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use(globalRateLimiter);

// Routes
app.use('/api', router);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

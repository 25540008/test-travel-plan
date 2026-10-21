import { Router } from 'express';
import { env } from '../config/env.js';
import healthRoutes from './health.routes.js';
import exampleRoutes from './example.routes.js';
import devRoutes from './dev.routes.js';

const router = Router();

router.use('/health', healthRoutes);

// Gắn router của từng module tại đây, giữ đúng đường dẫn trong SRS mục 8.4, ví dụ:
// router.use('/auth', authRoutes);
// router.use('/trips', tripRoutes);

if (!env.isProd) {
  router.use('/_example', exampleRoutes);
  router.use('/dev', devRoutes);
}

export default router;

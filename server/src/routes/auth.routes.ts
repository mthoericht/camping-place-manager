import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.post('/signup', ctrl.signupHandler);
router.post('/login', ctrl.loginHandler);
router.get('/me', requireAuth, ctrl.meHandler);

export default router;

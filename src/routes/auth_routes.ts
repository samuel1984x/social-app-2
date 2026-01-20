import { Router } from 'express';
import * as AuthController from '../controllers/auth_controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshTokenEndpoint);
router.post('/logout', authenticate, AuthController.logout);

export default router;

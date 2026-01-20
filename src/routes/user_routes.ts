import { Router } from 'express';
import * as UserController from '../controllers/user_controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', authenticate, UserController.updateUser);
router.delete('/:id', authenticate, UserController.deleteUser);

export default router;

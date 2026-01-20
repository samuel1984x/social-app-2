import { Router } from 'express';
import * as PostController from '../controllers/post_controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, PostController.addPost);
router.get('/', PostController.getPosts);
router.get('/:id', PostController.getPostById);
router.put('/:id', authenticate, PostController.updatePost);
router.delete('/:id', authenticate, PostController.deletePost);

export default router;

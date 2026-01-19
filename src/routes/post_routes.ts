import { Router } from 'express';
import * as PostController from '../controllers/post_controller';

const router = Router();

router.post('/', PostController.addPost);
router.get('/', PostController.getPosts);
router.get('/:id', PostController.getPostById);
router.put('/:id', PostController.updatePost);
router.delete('/:id', PostController.deletePost);

export default router;
